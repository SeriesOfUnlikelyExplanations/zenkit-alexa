'use strict';

const ZenKitClient = require('./api/zenKit.js');
const config = require('./config.js');

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
   * Get mapped key
   * @return {Promise}
   */
  keyMapper(key, zlists, reverse = false) {
    if (!(reverse)) {
      if (key === config.ALEXA_SHOPPING_LIST) {
        return config.ZENKIT_SHOPPING_LIST;
      } else if (key === config.ALEXA_TODO_LIST) {
        for (var k in zlists) {
          if (k.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return k; }
        }
        return config.ZENKIT_INBOX_LIST
      } else {
        return key
      }
    } else {
      if (key === config.ZENKIT_SHOPPING_LIST) {
        return config.ALEXA_SHOPPING_LIST;
      } else if (key.toLowerCase().includes(config.ZENKIT_TODO_LIST)) {
        return config.ALEXA_TODO_LIST
      } else if (key === config.ZENKIT_INBOX_LIST) {
        for (var k in zlists) {
          if (k.toLowerCase().includes(config.ZENKIT_TODO_LIST)) { return ''; }
        }
        return config.ALEXA_TODO_LIST
      } else {
        return key
      }
    }
  }
  /**
   * Get Alexa shopping list
   * @return {Promise}
   */
  async getAlexaLists() {
    // Get all lists
    const { lists } = await this.householdListManager.getListsMetadata();
    var res = {};
    lists.forEach(async (list) => {
      if (list.state === 'active') {
        const [active, completed] = await Promise.all([
          this.householdListManager.getList(list.listId, 'active'),
          this.householdListManager.getList(list.listId, 'completed')
        ]);
        res[list.name] = {listId: list.listId};
        res[list.name].listName = list.name;
        res[list.name].items = [].concat(active.items, completed.items);
      };
    });
    return res;
  }

  /**
   * Get zenkit lists
   * @return {Promise}
   */
  async getZenkitLists() {
    // Get lists
    var zlists = await this.zenKitClient.getLists();
    const elements = {};
    for (const [key, value] of Object.entries(zlists)) {
      elements[key] =  this.zenKitClient.getElements(value.shortId);
    }
    // Parse list paramaters
    for (const [key, value] of Object.entries(zlists)) {
      const element =  JSON.parse(await elements[key]);
      zlists[key].titleUuid = element.find(list => list.name ===  'Title').uuid;
      zlists[key].uncompleteId = element.find(list => list.name ===  'Stage')
        .elementData
        .predefinedCategories
        .find(list => list.name ===  'To-Do')
        .id;
      zlists[key].completeId = element.find(list => list.name ===  'Stage')
        .elementData
        .predefinedCategories
        .find(list => list.name ===  'Done')
        .id;
      zlists[key].stageUuid = element.find(list => list.name ===  'Stage').uuid;
    }
    return zlists;
  }

  /**
   * Get zenkit lists
   * @return {Promise}
   */
  async createZenkitLists(zlists, alists) {
    var flag = false;
    var workspace = '';
    //create zlist from alist if zlist doesn't exist
    for (const [key, value] of Object.entries(alists)) {
      const newKey = this.keyMapper(key, zlists);
      if (!(newKey in zlists)) {
        flag = true;
        console.log('Creating list: ' + newKey);
        workspace = workspace === '' ? await this.zenKitClient.getWorkspace() : workspace;
        this.zenKitClient.createList(newKey, workspace.id);
      }
    };
    if (flag) {
      return this.getZenkitLists()
    } else {
      return zlists
    };
  }
  /**
   * Update Alexa list
   * @return {Promise}
   */
  async updateAlexaList() {
    const [alexaLists, zenkitListTemp] = await Promise.all([
      this.getAlexaLists(), this.getZenkitLists()]);
    const zenkitLists = await this.createZenkitLists(zenkitListTemp, alexaLists);
    const promises = [];
    const zenkitListItemsArr = {};
    for (const [key, zenkitList] of Object.entries(zenkitLists)) {
      zenkitListItemsArr[zenkitList.id] = this.zenKitClient.getListItems(zenkitList.id, zenkitList.stageUuid);
    }
    for (const [key, zenkitList] of Object.entries(zenkitLists)) {
      const mappedKey = this.keyMapper(key, zenkitLists, true);
      if (!(mappedKey)) { continue; }
      const alexaList = alexaLists[mappedKey];
      const zenkitListItems = await zenkitListItemsArr[zenkitList.id];
      zenkitListItems.forEach((zenkitItem) => {
        // Find alexa matching item
        const alexaItem = alexaList.items.find(alexaItem =>
          alexaItem.value.toLowerCase() === zenkitItem.displayString.toLowerCase());
        // Determine alexa status based of Zenkit crossed off property
        const zenkitItemStatus = !zenkitItem.completed ? 'active' : 'completed';

        // Define get item properties function
        const getItemProperties = (alexaItem) => ({
          alexaId: alexaItem.id,
          zenKitUuidId: zenkitItem.uuid,
          zenKitEntryId: zenkitItem.id,
          status: alexaItem.status,
          updatedTime: new Date(alexaItem.updatedTime).toISOString(),
          value: alexaItem.value.toLowerCase(),
          version: alexaItem.version
        });

        if (typeof alexaItem !== 'undefined') {
          // Set alexa item to be updated if crossed off status not synced, otherwise leave untouched
          promises.push(zenkitItemStatus === alexaItem.status ? getItemProperties(alexaItem) :
            this.householdListManager.updateListItem(alexaList.listId, alexaItem.id, {
              value: alexaItem.value, status: zenkitItemStatus, version: alexaItem.version}
            ).then((item) => getItemProperties(item))
          );
        } else {
          // Set alexa item to be created
          promises.push(
            this.householdListManager.createListItem(alexaList.listId, {
              value: zenkitItem.displayString.toLowerCase(), status: zenkitItemStatus}
            ).then((item) => getItemProperties(item))
          );
        }
      });

      // Determine alexa item to be deleted if not present in zenkit list
      alexaList.items
        .filter(alexaItem =>
          zenkitListItems.every(zenkitItem =>
            zenkitItem.displayString.toLowerCase() !== alexaItem.value.toLowerCase()))
        .forEach(alexaItem =>
          promises.push(
            this.householdListManager.deleteListItem(alexaList.listId, alexaItem.id)));
      // put all the synced items into the synced lists
      const syncedItems = await Promise.all(promises);
      const syncedList = {
        alexaId: alexaList.listId,
        alexaListName: mappedKey,
        zenkitListName: key,
        items: syncedItems.filter(Boolean),
        listId: zenkitList.id,
        shortListId: zenkitList.ShortId,
        titleUuid: zenkitList.titleUuid,
        uncompleteId: zenkitList.uncompleteId,
        completeId: zenkitList.completeId,
        stageUuid: zenkitList.stageUuid
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
    const syncedList = this.syncedLists.find((syncedList) => syncedList.alexaId === request.listId);
    if (!(syncedList)) { return this.syncedLists; }
    const syncedItems = syncedList.items;
    const promises = [];
    // Get alexa items data based on request item ids if not delete request, otherwise use id only
    const alexaItems = await Promise.all(
      request.listItemIds.map(itemId => request.type === 'ItemsDeleted' ? {id: itemId} :
        this.householdListManager.getListItem(request.listId, itemId)));
    alexaItems.forEach((alexaItem) => {
      if (request.type === 'ItemsCreated') {
        // Determine synced item with alexa item value
        const syncedItem = syncedItems.find(item =>
          item.value.toLowerCase() === alexaItem.value.toLowerCase()
          || item.alexaId === alexaItem.id);
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
        console.log(syncedItem);
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
            this.householdListManager.deleteListItem(
              syncedList.alexaId, alexaItem.id));
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
}

module.exports = SyncListClient;
