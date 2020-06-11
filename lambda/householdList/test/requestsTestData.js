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
          "userId": "amzn1.ask.account.test",
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
          "todo_list_item_id"
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
          "userId": "amzn1.ask.account.test",
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
  }
})
