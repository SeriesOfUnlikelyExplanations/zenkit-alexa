const https = require('https');
const querystring = require('querystring');
const { randomUUID } = require('crypto');

/**
 * Defines ZenKit client class
 */
class ZenkitSDK {
  /**
   * Constructor
   * @param {String} apiUrl
   * @param {String} key
   */
  constructor(key, { keyType = 'Zenkit-API-Key', host = 'todo.zenkit.com', apiScope = 'api/v1' }) {
    this.host = host; // use this to determine which app we are in. This class is primarily modeled after todo, I'd like to modify to support the base and hypernotes app at some point.
    this.apiScope = apiScope;
    this.key = key;
    this.keyType = keyType; // can be 'Zenkit-API-Key' or 'Authorizaion' for oAuth Clients
  }

  async getWorkspaces() {
    this.workspaces = await this.handleRequest('users/me/workspacesWithLists');
    if (this.host === 'todo.zenkit.com') {
      this.defaultWorkspace = this.workspaces.find(({ resourceTags, lists})  =>
        resourceTags.some(({ appType, tag })  => appType === 'todos' && tag === 'defaultFolder')
        && lists.some(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'inbox'))
      )
    } else {
      this.defaultWorkspace = this.workspaces[0];
    }
    if (typeof this.defaultWorkspace != 'undefined') {
      this.defaultWorkspaceId = this.defaultWorkspace.id
    }
    return this.workspaces
  }
  
  async setDefaultWorkspaces(workspaceId) {
    if (!this.workspaces) {
      await this.getWorkspaces()
    }
    this.defaultWorkspace = this.workspaces.find(({ id }) => id === workspaceId);
    this.defaultWorkspaceId = this.defaultWorkspace.id
  }

  /**
   * Get all Lists data
   * @return {Promise}
   */
  async getListsInWorkspace(workspaceId=null) {
    if (!this.workspaces) {
      await this.getWorkspaces()
    }
    if (!workspaceId) {
      workspaceId = this.defaultWorkspaceId
    }
    const workspace = this.workspaces.find(({ id }) => id === workspaceId);
    if (typeof workspace === 'undefined') {
      return null
    }
    this.ListsInWorkspace = {};
    workspace.lists.forEach(list =>
      this.ListsInWorkspace[list.id] = {
        id: list.id,
        name: list.name,
        shortId: list.shortId,
        workspaceId: list.workspaceId,
        inbox: list.resourceTags.some(resourceTag => resourceTag.appType === 'todos' && resourceTag.tag === 'inbox')
      }
    );
    return this.ListsInWorkspace
  }
  
  /** 
   * Get all metadata about a list and all of it's items
   * @param {string} listId
   * @ return {Promise}
   */
  
  async getListDetails(listId) {
    const [elements, listItems] = await Promise.all([await this.handleRequest('lists/' + listId + '/elements'), this.handleRequest('lists/' + listId + '/entries/filter', 'POST')]);
    this.ListsInWorkspace[listId].titleUuid = elements.find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'title')).uuid;
    this.ListsInWorkspace[listId].uncompleteId = elements.find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'stage'))
      .elementData.predefinedCategories
      .find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'todo'))
      .id;
    this.ListsInWorkspace[listId].completeId = elements.find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'stage'))
      .elementData.predefinedCategories
      .find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'todo'))
      .id;
    this.ListsInWorkspace[listId].stageUuid = elements.find(({ resourceTags }) => resourceTags.some(({ appType, tag }) => appType === 'todos' && tag === 'stage')).uuid;
    listItems.forEach((item) => {
      item.completed = (item[this.ListsInWorkspace[listId].stageUuid  + '_categories_sort'].some(({ name }) => name === 'Done'));
    });
    this.ListsInWorkspace[listId].items = listItems;
    return await this.ListsInWorkspace[listId];
  }

  /**
   * Create list
   * @param {int} shortId
   * @param {string, null} stageUuid
   * @return {Promise}
   */
  async createList(listName, workspaceId=this.defaultWorkspace.id) {
    const lists = await this.handleRequest('workspaces/' + workspaceId + '/lists', 'POST', {name: listName})
    const list = lists.find(({ name }) => name == listName)
    console.log(list.id);
    this.ListsInWorkspace[list.id] = {
        id: list.id,
        name: list.name,
        shortId: list.shortId,
        workspaceId: list.workspaceId,
        inbox: list.resourceTags.some(resourceTag => resourceTag.appType === 'todos' && resourceTag.tag === 'inbox')
      }
    return await this.getListDetails(list.id)
  }

  /**
   * Delete list
   * @param {int} shortId
   * @param {string, null} stageUuid
   * @return {Promise}
   */
  deleteList(listId) {
    return this.handleRequest('lists/' + listId, 'DELETE')
  }

  /**
  * Add item to list
  * @param  {int}  listId
  * @param  {String}  titleUuid
  * @param  {String}  value
  * @return {Promise}
  */
  async addItem(listId, value, titleUuid = this.todoLists[listId].titleUuid) {
    if (typeof titleUuid =='undefined') {
      await this.getListDetails(listId)
      titleUuid = this.todoLists[listId].titleUuid
    }
    const scope = 'lists/' + listId + '/entries';
    const parameters = {
      'uuid': randomUUID(),
      'sortOrder': 'lowest',
      'displayString': value,
      [titleUuid + '_text']: value,
      [titleUuid + '_searchText']: value,
      [titleUuid + '_textType']: 'plain'
    };
    return this.handleRequest(scope, 'POST', parameters);
  }

  /**
  * Delete item from list
  * @param  {int}  listId
  * @param  {String}  itemUuid
  * @return {Promise}
  */
  deleteItem(listId, itemUuid) {
   const scope = 'lists/' + listId + '/entries/delete/filter';
   const parameters = {
     'shouldDeleteAll': false,
     'filter': {},
     'listEntryUuids': [itemUuid]
   };
   return this.handleRequest(scope, 'POST', parameters);
  }

  /**
   * update the "complete" status of an item
   * @param  {int}  listId
   * @param  {Int}  entryId
   * @param  {String} stageUuid
   * @param  {Int}  statusId
   * @return {Promise}
   */
  updateItemStatus(listId, entryId, statusId ) {
    const scope = 'lists/' + listId + '/entries/' + entryId;
    const parameters = {
      "updateAction": "replace",
      [this.todoLists[listId].stageUuid + "_categories"]: [statusId]
    };
    return this.handleRequest(scope, 'PUT', parameters);
  }

  /**
   * Update Item Title
   * @param  {int}  listId
   * @param  {Int}  entryId
   * @param  {String} titleUuid
   * @param  {String} value
   * @return {Promise}
   */
  updateItemTitle(listId, entryId, value) {
    const scope = 'lists/' + listId + '/entries/' + entryId;
    const parameters = {
      "updateAction": "replace",
      [this.todoLists[listId].titleUuid + '_text']: value
    };
    return this.handleRequest(scope, 'PUT', parameters);
  }

  /**
   //~ * Handle request
   //~ * @param  {string} scope
   //~ * @param  {string} method
   //~ * @param  {Object} parameters
   //~ * @return {Promise}
   //~ */
  async handleRequest(scope, method = 'GET', parameters = {}, queryParameters ={}) {
    // Define request options
    //~ queryParameters.ie = (new Date()).getTime();
    //~ queryParameters.show_archived = false
    var queryString = '';
    if (Object.keys(queryParameters).length) {
      queryString = `?${querystring.stringify(queryParameters)}`
    } 
    var options = {
      hostname: this.host,
      port: 443,
      path: `/${this.apiScope}/${scope}${queryString}`,
      method: method,
      headers: {
        'Cache-Control':'no-cache',
        [this.keyType]: this.key
      }
    }
    console.log(options);
    console.log(parameters);
    var paramString = '';
    if (Object.keys(parameters).length) {
      console.log(parameters);
      paramString = JSON.stringify(parameters);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(paramString)
    }
    
    return new Promise(function(resolve, reject) {
      var req = https.request(options, function(res) {
        var body = [];
        res.on('data', function(chunk) {
          body.push(chunk);
        });
        res.on('end', function() {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch(e) {
            try {
              body = Buffer.concat(body).toString();
            } catch(e) {
              reject(e);
            }
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            console.log(body);
            return reject(new Error('statusCode=' + res.statusCode));
          }
          resolve(body);
        });
      });
      req.on('error', function(e) {
        reject(e);
      });
      if (Object.keys(parameters).length) {
        console.log(paramString);
        req.write(paramString);
      }
      req.end();
    });
  }
}


module.exports = ZenkitSDK;
