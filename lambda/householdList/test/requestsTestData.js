'use strict';

//https://developer.amazon.com/en-US/docs/alexa/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList

module.exports = Object.freeze({

  ITEMS_CREATED_WITH_TOKEN: {
    "version": "1.0",
    "context": {
      "System": {
        "application": {
          "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
        },
        "user": {
          "userId": "amzn1.ask.account.create_test",
          "accessToken": "TestConsentToken",
          "permissions": {
            "consentToken": "TestConsentToken"
          }
        },
        "apiEndpoint": "https://api.amazonalexa.com",
        "apiAccessToken": "TestAlexaToken"
      }
    },
    "request": {
      "type": "AlexaHouseholdListEvent.ItemsCreated",
      "requestId": "6b6fa7fc-b801-4660-8f0d-9915b36e4897",
      "timestamp": "2020-05-20T16:22:42Z",
      "eventCreationTime": "2020-05-20T16:22:42Z",
      "eventPublishingTime": "2020-05-20T16:22:42Z",
      "body": {
        "listId": "todo_list_list_id",
        "listItemIds": [
          "todo_list_item_added_id"
        ]
      }
    }
  },
  TIME_SYNC: {
    "version": "1.0",
    "context": {
      "System": {
        "application": {
          "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
        },
        "user": {
          "userId": "amzn1.ask.account.time_test",
          "accessToken": "TestConsentToken",
          "permissions": {
            "consentToken": "TestConsentToken"
          }
        },
        "apiEndpoint": "https://api.amazonalexa.com",
        "apiAccessToken": "TestAlexaToken"
      }
    },
    "request": {
      "type": "Messaging.MessageReceived",
      "requestId": "amzn1.echo-api.request.3c49100d-cda4-4f75-be92-6215e0b23702",
      "timestamp": "2020-05-24T00:02:56Z",
      "message": {
        "event": "updateAlexaList"
      }
    }
  },
  GET_ATRTIBUTES_FOR_CREATE_ITEM : {
    "hold": false,
    "syncedLists": [
      {
        "alexaId": "todo_list_list_id",
        "alexaListName": "Alexa to-do list",
        "completeId": 7354598,
        "items": [

        ],
        "listId": 1067607,
        "shortListId": "i2Cs9iJ6Fi",
        "stageUuid": "d2b18ba1-be40-41b1-9fd7-92b477dabbba",
        "titleUuid": "febfd797-225d-48b4-8cec-61655c2cb240",
        "uncompleteId": 7354597,
        "workspaceId": 442548,
        "zenkitListName": "Inbox"
      },
      {
        "alexaId": "shopping_list_list_id",
        "alexaListName": "Alexa shopping list",
        "completeId": 73512252994620,
        "items": [
          {
            "alexaId": "dcdda1bf-0a2a-45b2-87f2-41b786719a5a",
            "status": "completed",
            "updatedTime": "2020-07-23T17:33:01.000Z",
            "value": "worcestershire sauce",
            "version": 1,
            "zenKitEntryId": 42,
            "zenKitUuidId": "23f9176c-5277-4c08-bcb2-4d12fc79486e"
          }
        ],
        "listId": 1225299,
        "shortListId": "CmhP8Fp28P",
        "stageUuid": "a40e01cb-d4af-4540-8e88-3b5b9703c755",
        "titleUuid": "5285fd24-ffa7-4942-a72c-3a2af0af524c",
        "uncompleteId": 7354619,
        "workspaceId": 442548,
        "zenkitListName": "Shopping list"
      }
    ],
    "userId": "amzn1.ask.account.create_test"
  }
})
