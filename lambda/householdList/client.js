'use strict';

const ZenKitClient = require('./api/zenKit.js');
const config = require('./config.js');

/**
 * Defines item value pattern
 * @type {RegExp}
 */
const ITEM_VALUE_PATTERN = /^([\w\s]+)(?: \((\d+)\))?$/;

/**
 * Defines sync list client class
 */
class SyncListClient {
  constructor(householdListManager, key = '', syncedList = {}) {
    this.zenKitClient = new ZenKitClient(
      config.ZENKIT_API_URL, key);
    this.householdListManager = householdListManager;
    this.syncedList = syncedList;
  }

  /**
   * Get Alexa shopping list
   * @return {Promise}
   */
  async getAlexaShoppingList() {
    // Get all lists
    const { lists } = await this.householdListManager.getListsMetadata();
    // Find shopping list
    const match = lists.find(list => list.name === config.ALEXA_SHOPPING_LIST);

    if (typeof match !== 'undefined') {
      // Get shopping list active and completed items
      const [active, completed] = await Promise.all([
        this.householdListManager.getList(match.listId, 'active'),
        this.householdListManager.getList(match.listId, 'completed')
      ]);
      // Return shopping list merging active & completed items
      return Object.assign(active, {items: [].concat(active.items, completed.items)});
    }
  }

  /**
   * Get zenkit lists
   * @return {Promise}
   */
  async getZenkitLists() {
    // Get shopping lists
    const workspace = await this.zenKitClient.getWorkspace();
    var zlists = await this.zenKitClient.getLists();
    //create Shopping List if it doesn't exist
    if (!(config.ZENKIT_SHOPPING_LIST in zlists)) {
      console.log('Creating Shopping List');
      const res = await this.zenKitClient.createList(config.ZENKIT_SHOPPING_LIST, workspace.id);
      zlists = await this.zenKitClient.getLists();
    }
    // Parse list paramaters
    const match = zlists[config.ZENKIT_SHOPPING_LIST];
    if (!match) {
      throw new Error('Shopping list not found - {try again}.')
    }
    const elements =  JSON.parse(await this.zenKitClient.getElements(match.shortId));
    match.titleUuid = elements.find(list => list.name ===  'Title').uuid;
    match.uncompleteId = elements.find(list => list.name ===  'Stage')
      .elementData
      .predefinedCategories
      .find(list => list.name ===  'To-Do')
      .id;
    match.completeId = elements.find(list => list.name ===  'Stage')
      .elementData
      .predefinedCategories
      .find(list => list.name ===  'Done')
      .id;
    match.stageUuid = elements.find(list => list.name ===  'Stage').uuid;
    return match; //TODO: return zlists instead and get all zenkit lists
  }

  /**
   * Update Alexa list
   * @return {Promise}
   */
  async updateAlexaList() {
    const [alexaList, zenkitList] = await Promise.all([
      this.getAlexaShoppingList(), this.getZenkitLists()]);
    const promises = [];

    // Determine alexa item to be added/updated using zenkit list as reference
    const zenkitListItems = await this.zenKitClient.getListItems(zenkitList.id, zenkitList.stageUuid);
    zenkitListItems.forEach((zenkitItem) => {
      // Find alexa matching item
      const alexaItem = alexaList.items.find(alexaItem =>
        alexaItem.value.toLowerCase() === zenkitItem.displayString.toLowerCase());

      // Determine alexa status based of ourGroceries crossed off property
      const zenkitItemStatus = !zenkitItem.completed ? 'active' : 'completed';

      // Define get item properties function
      const getItemProperties = (alexaItem) => ({
        alexaId: alexaItem.id,
        zenKitUuidId: zenkitItem.uuid,
        zenKitEntryId: zenkitItem.id,
        status: alexaItem.status,
        updatedTime: new Date(alexaItem.updatedTime).toISOString(),
        value: ITEM_VALUE_PATTERN.exec(alexaItem.value.toLowerCase())[1],
        quantity: ITEM_VALUE_PATTERN.exec(alexaItem.value)[2] || 1,
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
            value: zenkitItem.displayString, status: zenkitItemStatus}
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

    // Get synced items promise result
    const syncedItems = await Promise.all(promises);
    // Return synced list
    return this.syncedList = {
      alexaId: alexaList.listId,
      items: syncedItems.filter(Boolean),
      listId: zenkitList.id,
      shortListId: zenkitList.ShortId,
      titleUuid: zenkitList.titleUuid,
      uncompleteId: zenkitList.uncompleteId,
      completeId: zenkitList.completeId,
      stageUuid: zenkitList.stageUuid
    };
  }

  /**
   * Update zenKit list
   * @param  {Object}  request
   * @return {Promise}
   */
  async zenKitList(request) {
    const syncedItems = this.syncedList.items;
    const promises = [];

    // Handle request if from alexa shopping list
    if (this.syncedList.alexaId === request.listId) {
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
                this.syncedList.listId, this.syncedList.titleUuid, alexaItem.value.toLowerCase()
              ).then(function (res) {
                // Add new synced item
                syncedItems.push({
                  zenKitUuidId: res.uuid,
                  zenKitEntryId: res.id,
                  alexaId: alexaItem.id,
                  status: alexaItem.status,
                  updatedTime: new Date(alexaItem.updatedTime).toISOString(),
                  value: ITEM_VALUE_PATTERN.exec(alexaItem.value.toLowerCase())[1],
                  quantity: ITEM_VALUE_PATTERN.exec(alexaItem.value)[2] || 1,
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
              const [value, quantity=1] = ITEM_VALUE_PATTERN.exec(alexaItem.value.toLowerCase());

              // Set ourGroceries item to be renamed if alexa value different than synced item
              if (syncedItem.value !== value) {
                console.log(value);
                console.log(syncedItem.value);
                promises.push(
                this.zenKitClient.updateItemTitle(
                  this.syncedList.listId, syncedItem.zenKitEntryId,
                  this.syncedList.titleUuid, alexaItem.value.toLowerCase())
                );
              }

              // Set ourGroceries item crossed status to be updated if different
              if (syncedItem.status !== alexaItem.status) {
                promises.push(
                  this.zenKitClient.updateItemStatus(
                    this.syncedList.listId, syncedItem.zenKitEntryId, this.syncedList.stageUuid,
                    alexaItem.status === 'completed' ? this.syncedList.completeId : this.syncedList.uncompleteId)
                );
              }

              // Update synced item
              Object.assign(syncedItem, {
                status: alexaItem.status,
                updatedTime: new Date(alexaItem.updatedTime).toISOString(),
                value: ITEM_VALUE_PATTERN.exec(alexaItem.value.toLowerCase())[1],
                quantity: ITEM_VALUE_PATTERN.exec(alexaItem.value)[2] || 1,
                version: alexaItem.version
              });
            }
          } else {
            // Set alexa updated item to be deleted
            promises.push(
              this.householdListManager.deleteListItem(
                this.syncedList.alexaId, alexaItem.id));
          }
        } else if (request.type === 'ItemsDeleted') {
          // Determine synced item index with alexa item id
          const index = syncedItems.findIndex(item => item.alexaId === alexaItem.id);

          // Set ourGroceries item to be deleted if found
          if (index > -1) {
            promises.push(
              this.zenKitClient.deleteItem(
                this.syncedList.listId, syncedItems[index].zenKitUuidId));
            // Remove deleted synced item
            syncedItems.splice(index, 1);
          }
        }
      });
    }

    // Apply all changes
    await Promise.all(promises);
    // Return synced list
    return this.syncedList;
  }
}

module.exports = SyncListClient;
