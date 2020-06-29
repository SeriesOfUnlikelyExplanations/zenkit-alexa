'use strict';

//https://developer.amazon.com/en-US/docs/alexa/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList

module.exports = Object.freeze({
  // Test Data for '/v2/householdlists/' endpoint
  LISTS_DATA: {
    "lists": [
      {
        "listId": "shopping_list_list_id",
        "name": "Alexa shopping list",
        "state": "active",
        "version": 1,
        "statusMap": [
          {
            "href": "url",  // URL to get active list items in the list.
            "status": "active"
          },
          {
            "href": "url",  // URL to get completed list items in list.
            "status": "completed"
          }
        ]
      },
      {
        "listId": "todo_list_list_id",
        "name": "Alexa to-do list",
        "state": "active",
        "version": 1,
        "statusMap": [
          {
              "href": "url",
              "status": "active"
          },
          {
              "href": "url",
              "status": "completed"
          }
        ]
      },
      {
        "listId": "custom_list_list_id", // List id, String
        "name": "custom list",        // List name, String
        "state": "active",            // List state, Enum
        "version": 7,
        "statusMap": [
          {
            "href": "url",  // URL to get active list items in the list.
            "status": "active"
          },
          {
            "href": "url",  // URL to get completed list items in list.
            "status": "completed"
          }
        ]
      }
    ]
  },
  TODO_LIST_DATA: {
    "listId": 'todo_list_list_id' , // list id (String)
    "name":  'Alexa to-do list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [
      {
        "id": 'item_id_one', // item id (String, limit 256 characters)
        "version": 1, // item version (Positive integer)
        "value": 'todo item one', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      },
      {
        "id": 'item_id_two', // item id (String, limit 256 characters)
        "version": 2, // item version (Positive integer)
        "value": 'todo item two', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      }
    ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  SHOPPING_LIST_DATA: {
    "listId": 'shopping_list_list_id' , // list id (String)
    "name":  'Alexa Shopping list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [
      {
        "id": 'item_id_one', // item id (String, limit 256 characters)
        "version": 1, // item version (Positive integer)
        "value": 'todo item one', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      },
      {
        "id": 'item_id_two', // item id (String, limit 256 characters)
        "version": 2, // item version (Positive integer)
        "value": 'todo item two', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      }
    ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  CUSTOM_LIST_DATA: {
    "listId": 'custom_list_list_id' , // list id (String)
    "name":  'custom list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [
      {
        "id": 'item_id_one', // item id (String, limit 256 characters)
        "version": 1, // item version (Positive integer)
        "value": 'todo item one', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      },
      {
        "id": 'item_id_two', // item id (String, limit 256 characters)
        "version": 2, // item version (Positive integer)
        "value": 'todo item two', // item value (String, limit 256 characters)
        "status": 'active', // item status (Enum: "active" or "completed")
        "createdTime": 'Wed Jul 19 23:24:10 UTC 2017', // created time in format Wed Jul 19 23:24:10 UTC 2017
        "updatedTime": 'Wed Jul 19 23:24:10 UTC 2017', // updated time in format Wed Jul 19 23:24:10 UTC 2017
        "href": 'url' // URL to retrieve the item (String)
      }
    ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  EMPTY_SHOPPING_LIST_DATA: {
    "listId": 'shopping_list_list_id' , // list id (String)
    "name":  'Alexa Shopping list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [ ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  EMPTY_TODO_LIST_DATA: {
    "listId": 'todo_list_list_id' , // list id (String)
    "name":  'Alexa to-do list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [ ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  EMPTY_CUSTOM_LIST_DATA: {
    "listId": 'custom_list_list_id' , // list id (String)
    "name":  'custom list', // list name (String)
    "state": 'active', // "active" or "archived" (Enum)
    "version": 1, // list version (string)
    "items":
    [ ],
    "links": {
        "next": "v2/householdlists/{listId}/{status}?nextToken={nextToken}"
    }
  },
  TODO_LIST_ITEM_DATA: {
    "id": 'todo_list_item_id',    // item id (String, limit 60 characters)
    "version": 1, // item version (Positive integer)
    "value": 'todo item one', // item value (String, limit 256 characters)
    "status": 'active', // item status (Enum: "active" or "completed")
    "createdTime": 'Wed Sep 27 10:46:30 UTC 2017', // created time (Wed Sep 27 10:46:30 UTC 2017)
    "updatedTime": 'Wed Sep 27 10:46:30 UTC 2017', // updated time (Wed Sep 27 10:46:30 UTC 2017)
    "href": 'url'  // URL to retrieve the item (String)
  }
});
