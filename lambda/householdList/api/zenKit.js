'use strict';

const { v4: uuidv4 } = require('uuid');
const request = require('request-promise-native').defaults({
  jar: true
});

/**
 * Defines ZenKit client class
 */
class ZenKitClient {
  /**
   * Constructor
   * @param {String} apiUrl
   * @param {String} key
   */
  constructor(apiUrl, key) {
    this.apiUrl = apiUrl;
    this.key = key;
  }

  /**
   * Get all Lists data
   * @return {Promise}
   */
  getLists() {
    return this.handleRequest('users/me/workspacesWithLists')
      .then(function (body) {
        var res = {};
        JSON.parse(body).find(item =>
            item.resourceTags.some(e => e.appType === 'todos'))
          .lists
          .forEach(function(d){
            res[d.name] = {
              id: d.id,
              shortId: d.shortId };
          });
        return res
      });
  }
  /**
   * Get all elements for list
   * @param {int} shortId
   * @return {Promise}
   */
  getElements(shortId) {
    return this.handleRequest('lists/' + shortId + '/elements');
  }

  /**
   * Get all elements for list
   * @param {int} shortId
   * @return {Promise}
   */
  getListItems(listId, stageUuid = '') {
    return this.handleRequest('lists/' + listId + '/entries/filter', 'POST')
      .then(function(res) {
        if (stageUuid) {
          res.forEach((item) => {
            item.completed = (item[stageUuid + '_categories_sort'].some(e => e.name === 'Done'));
          });
        }
        return res;
      });
  }

  /**
  * Add item to list
  * @param  {String}  listId
  * @param  {String}  titleUuid
  * @param  {String}  value
  * @return {Promise}
  */
  addItem(listId, titleUuid, value) {
    const scope = 'lists/' + listId + '/entries';
    const parameters = {
      'uuid': uuidv4(),
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
  * @param  {String}  listId
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
   * @param  {String}  listId
   * @param  {Int}  entryId
   * @param  {String} stageUuid
   * @param  {Int}  statusId
   * @return {Promise}
   */
  updateItemStatus(listId, entryId, stageUuid, statusId ) {
    const scope = 'lists/' + listId + '/entries/' + entryId;
    const parameters = {
      "updateAction": "replace",
      [stageUuid + "_categories"]: [statusId]
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
  updateItemTitle(listId, entryId, titleUuid, value) {
    const scope = 'lists/' + listId + '/entries/' + entryId;
    const parameters = {
      "updateAction": "replace",
      [titleUuid + '_text']: value
    };
    return this.handleRequest(scope, 'PUT', parameters);
  }

  /**
   * Handle request
   * @param  {Object}  parameters
   * @return {Promise}
   */
  async handleRequest(scope, method = 'GET', parameters = {}) {
    // Define request options
    const options = {
        method: method,
        uri: `${this.apiUrl}/${scope}`,
        headers: {
          'Authorization': this.key
        }
      }
    if ( ['PUT','POST'].includes(method)) {
      options['body'] = parameters;
      options['json'] = true
    }
    return request(options);
  }
}

module.exports = ZenKitClient;
