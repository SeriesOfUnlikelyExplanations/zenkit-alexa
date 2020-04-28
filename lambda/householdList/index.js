'use strict';

const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const SkillMessagingApi = require('./api/skillMessaging.js');
const SyncListClient = require('./client.js');
const events = require('./events.js');
const config = require('./config.js');

const HouseholdListEventHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaHouseholdListEvent.ItemsCreated' ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaHouseholdListEvent.ItemsUpdated' ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaHouseholdListEvent.ItemsDeleted';
  },
  async handle(handlerInput) {
    try {
      // Get latest user attributes from database
      const attributes = await handlerInput.attributesManager.getPersistentAttributes();
      var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
      // Define request object
      const request = Object.assign(handlerInput.requestEnvelope.request.body, {
        type: Alexa.getRequestType(handlerInput.requestEnvelope).split('.').pop()
      });
      // Initialize sync list client
      if ('syncedLists' in attributes && 'alexaId' in attributes.syncedLists[0]) {
        const client = new SyncListClient(
          handlerInput.serviceClientFactory.getListManagementServiceClient(), accessToken, attributes.syncedLists);
        // Update synced list attribute based on Zenkit list changes
        attributes.syncedLists = await client.updateZenkitList(request);
      } else {
        const client = new SyncListClient(
          handlerInput.serviceClientFactory.getListManagementServiceClient(), accessToken);
        // Update synced list attribute based on Alexa list changes
        attributes.syncedLists = await client.updateAlexaList();
      };
      console.info('Zenkit shopping list has been synced.', JSON.stringify(attributes.syncedLists));
      // Store latest user attributes to database
      handlerInput.attributesManager.setPersistentAttributes(attributes);
      await handlerInput.attributesManager.savePersistentAttributes();
      console.info('User attributes have been saved.');
    } catch (error) {
      console.error('Failed to handle household list items event:', JSON.stringify(error));
      console.log(error);
    }
  }
};

const SkillEventHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillDisabled' ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillPermissionAccepted' ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillPermissionChanged' ||
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillAccountLinked';
  },
  async handle(handlerInput) {
    try {
      // Define attributes object
      var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
      const attributes = {
        userId: Alexa.getUserId(handlerInput.requestEnvelope)
      };
      // Determine accepted permissions
      const permissions = (handlerInput.requestEnvelope.request.body.acceptedPermissions || []).map(
        permission => permission.scope.split(':').pop());

      // Update alexa shopping list if read/write permissions accepted, otherwise clean up database
      if ((permissions.includes('read') && permissions.includes('write')) || Alexa.getRequestType(handlerInput.requestEnvelope) === 'AlexaSkillEvent.SkillAccountLinked' ) {
        // Initialize sync list client
        const client = new SyncListClient(
          handlerInput.serviceClientFactory.getListManagementServiceClient(), accessToken);
        // Update synced list attribute based on Alexa list changes
        attributes.syncedLists = await client.updateAlexaList();
        console.info('Alexa shopping list has been synced.', JSON.stringify(attributes.syncedLists));
        // Store user attributes to database
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        await handlerInput.attributesManager.savePersistentAttributes();
        console.info('User attributes have been saved.');
        // Create zenKit list sync event schedule
        if (handlerInput.context.invokedFunctionArn) { //don't setup sechdule if running locally.
          await events.createSchedule(
            handlerInput.context.invokedFunctionArn, Alexa.getUserId(handlerInput.requestEnvelope));
          console.info('Event schedule has been created.');
      };
      } else {
        // Delete user attributes to database
        await handlerInput.attributesManager.deletePersistentAttributes();
        console.info('User attributes have been deleted.');
      }
    } catch (error) {
      console.error('Failed to handle skill permission event:', JSON.stringify(error));
      console.log(error);
    }
  }
};

const SkillMessagingHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Messaging.MessageReceived';
  },
  async handle(handlerInput) {
    try {
      // Get latest user attributes from database
      const attributes = await handlerInput.attributesManager.getPersistentAttributes();
      var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
      // Initialize sync list client
      const client = new SyncListClient(
        handlerInput.serviceClientFactory.getListManagementServiceClient(), accessToken);
      // Update synced list attribute based on Alexa list changes if requested
      if (handlerInput.requestEnvelope.request.message.event === 'updateAlexaList') {
        attributes.syncedLists = await client.updateAlexaList();
        console.info('Alexa shopping list has been synced.', JSON.stringify(attributes.syncedLists));
      }
      // Store user attributes to database
      handlerInput.attributesManager.setPersistentAttributes(attributes);
      await handlerInput.attributesManager.savePersistentAttributes();
      console.info('User attributes have been saved.');
    } catch (error) {
      console.error('Failed to handle skill messaging event:', JSON.stringify(error));
      console.log(error);
    }
  }
}

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('Request error:', JSON.stringify(error));
  }
};

const LogRequestInterceptor = {
  process(handlerInput) {
    if (typeof handlerInput.requestEnvelope !== 'undefined') {
      console.log('Request received:', JSON.stringify(handlerInput.requestEnvelope));
    }
  }
};

const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: config.DDB_TABLE_NAME,
  createTable: true,
  partitionKeyName: 'userId'
});

const scheduledEventHandler = async (event) => {
  console.log('Event received:', JSON.stringify(event));
  // Send skill message if relevant event type
  if (event.type === 'skillMessaging') {
    const userIds = await events.getEventUsers(config.DDB_TABLE_NAME);
    const promises = [];
    for (var userId of userIds) {
      const api = new SkillMessagingApi(
        config.ALEXA_API_URL, config.SKILL_CLIENT_ID, config.SKILL_CLIENT_SECRET, userId);
      promises.push(api.sendMessage(event.message)
        .then(console.log('Skill message sent: ', userId))
        .catch(async (error) => {
          if (error.error.message && error.error.message === 'Invalid user id.') {
            await events.deleteUser(userId, config.DDB_TABLE_NAME)
              .then((res) => {
                console.log('Deleted User ID: ' + userId);
              });
          } else {
            console.error(`Failed to handle scheduled event ${event.type}:`, JSON.stringify(error));
            console.log(error);
          };
        })
      );
    }
    await Promise.all(promises);
  }
};

const skillHandler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    HouseholdListEventHandler,
    SkillEventHandler,
    SkillMessagingHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(LogRequestInterceptor)
  .withApiClient(new Alexa.DefaultApiClient())
  .withPersistenceAdapter(persistenceAdapter)
  .withSkillId(config.SKILL_APP_ID)
  .lambda();

exports.handler = (event, context, callback) =>
  (event.source === 'aws.events' ? scheduledEventHandler : skillHandler)(event, context, callback);
