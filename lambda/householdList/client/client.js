'use strict';

const ZenkitSDK = require('zenkitsdk');
const config = require('../config.js');
const { backOff } =  require('exponential-backoff');

/**
 * Defines sync list client class
 */
class SyncListClient {
  constructor(householdListManager, key, syncedLists = []) {
    this.zenKitClient = new ZenkitSDK(key, { keyType: 'Authorization' });
    this.householdListManager = householdListManager;
    this.syncedLists = syncedLists;
  }

  /**
   * Take a zenkit list name and map it to the right Alexa list name
   * @return {Promise}
   */
  mapZenkitToAlexaLists(listName, zenkitLists) {
    if (listName === config.ZENKIT_SHOPPING_LIST) {
      return config.ALEXA_SHOPPING_LIST;
    } else if (listName.toLowerCase().includes(config.ZENKIT_TODO_LIST)) {
      return config.ALEXA_TODO_LIST
    } else if (listName === config.ZENKIT_INBOX_LIST) {
      for (const [listId, list] of Object.entries(zenkitLists)) {
        if (list.name.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return ''; }
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
  mapAlexaToZenkitLists(listName, zenkitLists) {
    if (listName === config.ALEXA_SHOPPING_LIST) {
      return config.ZENKIT_SHOPPING_LIST;
    } else if (listName === config.ALEXA_TODO_LIST) {
      for (const [listId, list] of Object.entries(zenkitLists)) {
        if (list.name.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return list.name; }
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
   * Update Alexa list
   * @return {Promise}
   */
  async updateAlexaList(newUser = false) {
    var [alexaLists, zenkitLists] = await Promise.all([
      this.getAlexaLists(), this.zenKitClient.getListsInWorkspace()]);
    if (!zenkitLists) {
      this.zenKitClient.setDefaultWorkspace(this.zenKitClient.workspaces[0].id);
      zenkitLists = await this.zenKitClient.getListsInWorkspace();
    }
    var workspace = '';
    //Itterate over alexa lists and make sure zenkit list exists and has metadata
    for (const [alexaListName, value] of Object.entries(alexaLists)) {
      const zenkitListName = this.mapAlexaToZenkitLists(alexaListName, zenkitLists);
      if (!(Object.keys(zenkitLists).some(key => zenkitLists[key].name === zenkitListName))) {
        console.log('Creating list: ' + zenkitListName);
        const newList = await this.zenKitClient.createList(zenkitListName);
        zenkitLists[newList.id] = newList;
      };
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
    for (var [zenkitListId, zenkitList] of Object.entries(zenkitLists)) {
      const promises = [];
      console.log(zenkitLists);
      const alexaListName = this.mapZenkitToAlexaLists(zenkitList.name, zenkitLists);
      if (!(alexaListName)) { continue; }
      const alexaList = alexaLists[alexaListName];
      if (!(alexaList)) { continue; }
      zenkitList = await this.zenKitClient.getListDetails(zenkitListId);
      
      const zenkitListItems = zenkitList.items;
      const alreadySyncedItems = [];
      zenkitListItems.forEach((zenkitItem) => {
        // Determine alexa status based of Zenkit completed property
        const zenkitItemStatus = zenkitItem.completed ? 'completed' : 'active';
        // Find alexa matching item
        const alexaItem = alexaList.items.find(({value, status, id})   =>
          value.toLowerCase() === zenkitItem.displayString.toLowerCase() && status === zenkitItemStatus
          && !alreadySyncedItems.includes(id));
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
        zenkitListName: zenkitList.name,
        items: syncedItems.filter(Boolean),
        listId: zenkitList.id,
        shortListId: zenkitList.shortId,
        titleUuid: zenkitList.titleUuid,
        uncompleteId: zenkitList.uncompleteId,
        completeId: zenkitList.completeId,
        stageUuid: zenkitList.stageUuid,
        workspaceId: zenkitList.workspaceId
      };
      console.log(syncedList);
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
    if (!syncedList) {
      const list = await backOff(() => this.householdListManager.getList(request.listId, 'active'));
      console.log('Creating new list: ' + list.name);
      const zenkitList = await this.zenKitClient.createList(list.name, this.syncedLists[0].workspaceId);
      this.syncedLists.push({
        alexaId: request.listId,
        alexaListName: list.name,
        zenkitListName: list.name,
        items: [],
        listId: zenkitList.id,
        shortListId: zenkitList.shortId,
        titleUuid: zenkitList.titleUuid,
        uncompleteId: zenkitList.uncompleteId,
        completeId: zenkitList.completeId,
        stageUuid: zenkitList.stageUuid,
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
    
    this.zenKitClient.updateListDetails(syncedList.listId, syncedList);
    alexaItems.forEach((alexaItem) => {
      if (request.type === 'ItemsCreated') {
        // Determine synced item with alexa item value
        const syncedItem = syncedItems.find(item => item.alexaId === alexaItem.id);
        if (!syncedItem) {
          promises.push(
            // Set zenKit item to be added
            this.zenKitClient.addItem(
              syncedList.listId, alexaItem.value.toLowerCase()
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
                syncedList.listId, syncedItem.zenKitEntryId, alexaItem.value.toLowerCase())
              );
            }
            // Set zenkit item crossed status to be updated if different
            if (syncedItem.status !== alexaItem.status) {
              if (alexaItem.status === 'completed') {
                promises.push(
                  this.zenKitClient.completeItem(syncedList.listId, syncedItem.zenKitEntryId)
                )
              } else {
                promises.push(
                  this.zenKitClient.uncompleteItem(syncedList.listId, syncedItem.zenKitEntryId)
                );
              }
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
   * Create Zenkit to-do list item letting the customer know that the account sync failed
   * @return {Promise}
   */
  async createSyncToDo(listEntryName = "Zenkit Alexa Sync is not setup correctly!") {
    // Get all lists
    const { lists } = await backOff(() => this.householdListManager.getListsMetadata());
    const listId = lists.find(item => item.name === config.ALEXA_TODO_LIST)
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
