'use strict';

const ZenKitClient = require('./api/zenKit.js');
const config = require('./config.js');
const { backOff } =  require('exponential-backoff');

/**
 * Defines sync list client class
 */
class SyncListClient {
  constructor(householdListManager, key = '', syncedLists = []) {
    this.zenKitClient = new ZenKitClient(
      config.ZENKIT_API_URL, key);
    this.householdListManager = householdListManager;
    this.syncedLists = syncedLists;
  }

  /**
   * Take a zenkit list name and map it to the right Alexa list name
   * @return {Promise}
   */
  mapZenkitToAlexaLists(listName, zlists) {
    if (listName === config.ZENKIT_SHOPPING_LIST) {
      return config.ALEXA_SHOPPING_LIST;
    } else if (listName.toLowerCase().includes(config.ZENKIT_TODO_LIST)) {
      return config.ALEXA_TODO_LIST
    } else if (listName === config.ZENKIT_INBOX_LIST) {
      for (var k in zlists) {
        if (k.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return ''; }
      }
      return config.ALEXA_TODO_LIST
    } else {
      return listName
    }
  }
  /**
  * Take a Alexa list name and map it to the right Zenkit list name
  * @return {Promise}
  */
  mapAlexaToZenkitLists(listName, zlists) {
    if (listName === config.ALEXA_SHOPPING_LIST) {
      return config.ZENKIT_SHOPPING_LIST;
    } else if (listName === config.ALEXA_TODO_LIST) {
      for (var k in zlists) {
        if (k.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return k; }
      }
      return config.ZENKIT_INBOX_LIST
    } else {
      return listName
    }
  }
  /**
   * Get Alexa lists
   * @return {Promise}
   */
  async getAlexaLists() {
    // Get all lists
    const { lists } = await backOff(() => this.householdListManager.getListsMetadata());
    var res = {};
    for (const list of lists) {
      if (list.state === 'active') {
        const [active, completed] = await Promise.all([
          backOff(() => this.householdListManager.getList(list.listId, 'active')),
          backOff(() => this.householdListManager.getList(list.listId, 'completed'))
        ]);
        res[list.name] = {listId: list.listId,
          listName: list.name,
          items: [].concat(active.items, completed.items)};
      }
    }
    return res;
  }

  /**
   * Get zenkit lists
   * @return {Promise}
   */
  zenkitListMetadata(zlist) {
    const element =  this.zenKitClient.getElements(zlist.shortId).then(item => JSON.parse(item));
    zlist.titleUuid = element.then(item => item.find(list => list.name ===  'Title').uuid);
    zlist.uncompleteId = element.then(item => item.find(list => list.name ===  'Stage')
      .elementData
      .predefinedCategories
      .find(list => list.name ===  'To-Do')
      .id);
    zlist.completeId = element.then(item => item.find(list => list.name ===  'Stage')
      .elementData
      .predefinedCategories
      .find(list => list.name ===  'Done')
      .id);
    zlist.stageUuid = element.then(item => item.find(list => list.name ===  'Stage').uuid);
    return zlist;
  }

  /**
   * Update Alexa list
   * @return {Promise}
   */
  async updateAlexaList(newUser = false) {
    const [alexaLists, zenkitLists] = await Promise.all([
      this.getAlexaLists(), this.zenKitClient.getLists()]);
    var workspace = '';
    //Itterate over alexa lists and make sure zenkit list exists and has metadata
    for (const [alexaListName, value] of Object.entries(alexaLists)) {
      const zenkitListName = this.mapAlexaToZenkitLists(alexaListName, zenkitLists);
      if (!(zenkitListName in zenkitLists)) {
        console.log('Creating list: ' + zenkitListName);
        workspace = workspace === '' ? await this.zenKitClient.getWorkspace() : workspace;
        zenkitLists[zenkitListName] = this.zenkitListMetadata(await this.zenKitClient.createList(zenkitListName, workspace.id));
      } else {
        zenkitLists[zenkitListName] = this.zenkitListMetadata(zenkitLists[zenkitListName]);
      }
      zenkitLists[zenkitListName].items = zenkitLists[zenkitListName].stageUuid.then(stageUuid => this.zenKitClient.getListItems(zenkitLists[zenkitListName].id, stageUuid));
    }
    console.log('Alexa Lists:');
    console.log(alexaLists);
    console.log('Zenkit Lists:');
    console.log(zenkitLists);
    // Define get item properties function
    const getItemProperties = (alexaItem, zenkitItem) => ({
      alexaId: alexaItem.id,
      zenKitUuidId: zenkitItem.uuid,
      zenKitEntryId: zenkitItem.id,
      status: alexaItem.status,
      updatedTime: new Date(alexaItem.updatedTime).toISOString(),
      value: alexaItem.value.toLowerCase(),
      version: alexaItem.version
    });
    for (const [zenkitListName, zenkitList] of Object.entries(zenkitLists)) {
      const promises = [];
      const alexaListName = this.mapZenkitToAlexaLists(zenkitListName, zenkitLists);
      if (!(alexaListName)) { continue; }
      const alexaList = alexaLists[alexaListName];
      if (!(alexaList)) { continue; }
      const zenkitListItems = await zenkitLists[zenkitListName].items;
      const alreadySyncedItems = [];
      zenkitListItems.forEach((zenkitItem) => {
        // Determine alexa status based of Zenkit completed property
        const zenkitItemStatus = zenkitItem.completed ? 'completed' : 'active';
        // Find alexa matching item
        const alexaItem = alexaList.items.find(alexaItem =>
          alexaItem.value.toLowerCase() === zenkitItem.displayString.toLowerCase() && alexaItem.status === zenkitItemStatus
          && !alreadySyncedItems.includes(alexaItem.id));
        if (typeof alexaItem !== 'undefined') {
          // Set alexa item to be updated if crossed off status not synced, otherwise leave untouched
          promises.push(zenkitItemStatus === alexaItem.status ? getItemProperties(alexaItem, zenkitItem) :
            backOff(() => this.householdListManager.updateListItem(alexaList.listId, alexaItem.id, {
              value: alexaItem.value.substring(0, 256), status: zenkitItemStatus, version: alexaItem.version}
            )).then((item) => getItemProperties(item, zenkitItem))
          );
          alreadySyncedItems.push(alexaItem.id);
        } else {
          // Set alexa item to be created
          promises.push(
            backOff(() => this.householdListManager.createListItem(alexaList.listId, {
              value: zenkitItem.displayString.toLowerCase().substring(0, 256), status: zenkitItemStatus}
            )).then((item) => getItemProperties(item, zenkitItem))
          );
        }
      });

      // Determine Alexa items not present in zenkit list - if it's a new user then add them to zenkit if it's an existing user, then delete them.
      if (newUser) {
        zenkitList.titleUuid = await zenkitList.titleUuid;
        alexaList.items
          .filter(alexaItem =>
            zenkitListItems.every(zenkitItem =>
              zenkitItem.displayString.toLowerCase() !== alexaItem.value.toLowerCase() && alexaItem.status !== (zenkitItem.completed ? 'completed' : 'active')))
          .forEach(alexaItem =>
            promises.push(
              this.zenKitClient.addItem(
                zenkitList.id, zenkitList.titleUuid, alexaItem.value.toLowerCase())
              .then(zenkitItem => getItemProperties(alexaItem, zenkitItem))
            )
          );
      } else {
        const alreadySyncedItems = [];
        alexaList.items.forEach((alexaItem) => {
          const zenkitItem = zenkitListItems.find(zenkitItem =>
            zenkitItem.displayString.toLowerCase() === alexaItem.value.toLowerCase()
              && alexaItem.status === (zenkitItem.completed ? 'completed' : 'active')
              && !alreadySyncedItems.includes(alexaItem.id));
          if (typeof zenkitItem === 'undefined') {
            promises.push(
              backOff(() => this.householdListManager.deleteListItem(alexaList.listId, alexaItem.id))
            );
          }
          alreadySyncedItems.push(alexaItem.id);
        });
      }
      // put all the synced items into the synced lists
      const syncedItems = await Promise.all(promises);
      const syncedList = {
        alexaId: alexaList.listId,
        alexaListName: alexaListName,
        zenkitListName: zenkitListName,
        items: syncedItems.filter(Boolean),
        listId: zenkitList.id,
        shortListId: zenkitList.shortId,
        titleUuid: await zenkitList.titleUuid,
        uncompleteId: await zenkitList.uncompleteId,
        completeId: await zenkitList.completeId,
        stageUuid: await zenkitList.stageUuid,
        workspaceId: zenkitList.workspaceId
      };
      this.syncedLists.push(syncedList);
    }
    //Return synced items promise result
    return this.syncedLists
  }

  /**
   * Update zenKit list
   * @param  {Object}  request
   * @return {Promise}
   */
  async updateZenkitList(request) {
    var syncedList = this.syncedLists.find((syncedList) => syncedList.alexaId === request.listId);
    if (!(syncedList)) {
      const list = await backOff(() => this.householdListManager.getList(request.listId, 'active'));
      console.log('Creating new list: ' + list.name);
      const zenkitList = await this.zenKitClient.createList(list.name, this.syncedLists[0].workspaceId);
      const element = JSON.parse(await this.zenKitClient.getElements(zenkitList.shortId));
      this.syncedLists.push({
        alexaId: request.listId,
        alexaListName: list.name,
        zenkitListName: list.name,
        items: [],
        listId: zenkitList.id,
        shortListId: zenkitList.shortId,
        titleUuid: element.find(list => list.name ===  'Title').uuid,
        uncompleteId: element.find(list => list.name ===  'Stage')
          .elementData
          .predefinedCategories
          .find(list => list.name ===  'To-Do')
          .id,
        completeId: element.find(list => list.name ===  'Stage')
          .elementData
          .predefinedCategories
          .find(list => list.name ===  'Done')
          .id,
        stageUuid: element.find(list => list.name ===  'Stage').uuid,
        workspaceId: zenkitList.workspaceId
      })
      syncedList = this.syncedLists.find((syncedList) => syncedList.alexaId === request.listId);
    }
    const syncedItems = syncedList.items;
    const promises = [];
    // Get alexa items data based on request item ids if not delete request, otherwise use id only
    const alexaItems = await Promise.all(
      request.listItemIds.map(itemId => request.type === 'ItemsDeleted' ? {id: itemId} :
        backOff(() => this.householdListManager.getListItem(request.listId, itemId))));
    alexaItems.forEach((alexaItem) => {
      if (request.type === 'ItemsCreated') {
        // Determine synced item with alexa item value
        const syncedItem = syncedItems.find(item => item.alexaId === alexaItem.id);
        if (!syncedItem) {
          promises.push(
            // Set zenKit item to be added
            this.zenKitClient.addItem(
              syncedList.listId, syncedList.titleUuid, alexaItem.value.toLowerCase()
            ).then(function (res) {
              // Add new synced item
              syncedItems.push({
                zenKitUuidId: res.uuid,
                zenKitEntryId: res.id,
                alexaId: alexaItem.id,
                status: alexaItem.status,
                updatedTime: new Date(alexaItem.updatedTime).toISOString(),
                value: alexaItem.value.toLowerCase(),
                version: alexaItem.version
              });
            })
          );
        }
      } else if (request.type === 'ItemsUpdated') {
        // Determine synced item with alexa item id
        const syncedItem = syncedItems.find(item => item.alexaId === alexaItem.id);
        if (syncedItem) {
          // Update existing item only if updated time on synced item is lower than alexa item
          if (new Date(syncedItem.updatedTime).getTime() < new Date(alexaItem.updatedTime).getTime()) {
            const value = alexaItem.value.toLowerCase();
            // Set zenkit item to be renamed if alexa value different than synced item
            if (syncedItem.value !== value) {
              promises.push(
              this.zenKitClient.updateItemTitle(
                syncedList.listId, syncedItem.zenKitEntryId,
                syncedList.titleUuid, alexaItem.value.toLowerCase())
              );
            }
            // Set zenkit item crossed status to be updated if different
            if (syncedItem.status !== alexaItem.status) {
              promises.push(
                this.zenKitClient.updateItemStatus(
                  syncedList.listId, syncedItem.zenKitEntryId, syncedList.stageUuid,
                  alexaItem.status === 'completed' ? syncedList.completeId : syncedList.uncompleteId)
              );
            }
            // Update synced item
            Object.assign(syncedItem, {
              status: alexaItem.status,
              updatedTime: new Date(alexaItem.updatedTime).toISOString(),
              value: alexaItem.value.toLowerCase(),
              version: alexaItem.version
            });
          }
        } else {
          // Set alexa updated item to be deleted
          promises.push(
            backOff(() => this.householdListManager.deleteListItem(
              syncedList.alexaId, alexaItem.id)));
        }
      } else if (request.type === 'ItemsDeleted') {
        // Determine synced item index with alexa item id
        const index = syncedItems.findIndex(item => item.alexaId === alexaItem.id);
        // Set Zenkit item to be deleted if found
        if (index > -1) {
          promises.push(
            this.zenKitClient.deleteItem(
              syncedList.listId, syncedItems[index].zenKitUuidId));
          // Remove deleted synced item
          syncedItems.splice(index, 1);
        }
      }
    });

    // Apply all changes
    await Promise.all(promises);
    // Return synced list
    const index = this.syncedLists.findIndex((syncedList) => syncedList.alexaId === request.listId);
    this.syncedLists[index] = syncedList;
    return this.syncedLists;
  }

  /**
   * Create to-do list item letting the customer know that the account sync failed
   * @return {Promise}
   */
  async createSyncToDo() {
    const listEntryName = 'Zenkit Alexa Sync is not setup correctly! Go to https://www.amazon.com/dp/B087C8XQ3T and click on "Link Account"'
    // Get all lists
    const { lists } = await backOff(() => this.householdListManager.getListsMetadata());
    const listId = lists.find(item => item.name === 'Alexa to-do list')
        .listId;
    const listItems = await backOff(() => this.householdListManager.getList(listId, 'active'));
    if (listItems.items.find(item => item.value === listEntryName)) {
      return 'Sync item already present'
    } else {
      return backOff(() => this.householdListManager.createListItem(
        listId, {
        value: listEntryName , status: 'active'}
      ));
    };
  }
}

module.exports = SyncListClient;
