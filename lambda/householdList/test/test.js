var assert = require('assert');
var expect = require('chai').expect;
const nock = require('nock');
var sinon = require('sinon');
const context = require('aws-lambda-mock-context');
var index = require('../index');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
var AWS = require('aws-sdk');

const req = require('./requestsTestData.js');
const alexa = require('./alexaTestData.js');
const zenkit = require('./zenkitTestData.js');

// https://sinonjs.org/how-to/stub-dependency/
describe("Testing the skill", function() {
  this.timeout(4000);
  before(() => {
    nock('https://api.amazonalexa.com')
      .persist()
      .get('/v2/householdlists/')
      .reply(200, alexa.LISTS_DATA)
      .get('/v2/householdlists/todo_list_list_id/active/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id/completed/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id/items/todo_list_item_id/')
      .reply(200, alexa.TODO_LIST_ITEM_DATA)
      .get('/v2/householdlists/todo_list_list_id/items/todo_list_item_id/')
      .reply(200, alexa.TODO_LIST_ITEM_DATA)
      .get('/v2/householdlists/todo_list_list_id/items/todo_list_item_added_id/')
      .reply(200, alexa.TODO_LIST_ITEM_ADDED_DATA)
      .get('/v2/householdlists/todo_list_list_id_missing/active/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id_missing/completed/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id_missing/items/todo_list_item_id/')
      .reply(200, alexa.TODO_LIST_ITEM_DATA)
      .get('/v2/householdlists/todo_list_list_id_missing/items/todo_list_item_id/')
      .reply(200, alexa.TODO_LIST_ITEM_DATA)
      .get('/v2/householdlists/todo_list_list_id_missing/items/todo_list_item_added_id/')
      .reply(200, alexa.TODO_LIST_ITEM_ADDED_DATA)
      .get('/v2/householdlists/shopping_list_list_id/active/')
      .reply(200, alexa.SHOPPING_LIST_DATA)
      .get('/v2/householdlists/shopping_list_list_id/completed/')
      .reply(200, alexa.EMPTY_SHOPPING_LIST_DATA)
      .get('/v2/householdlists/custom_list_list_id/active/')
      .reply(200, alexa.CUSTOM_LIST_DATA)
      .get('/v2/householdlists/custom_list_list_id/completed/')
      .reply(200, alexa.EMPTY_CUSTOM_LIST_DATA);

    zenkitNock = nock('https://todo.zenkit.com:443')
      .persist()
      .get('/api/v1/users/me/workspacesWithLists')
      .reply(200, zenkit.ZENKIT_WORKSPACE_DATA)
      .post('/api/v1/workspaces/442548/lists')
      .reply(200, zenkit.GET_LISTS_IN_WORKSPACE)
      .post('/api/v1/workspaces/442026/lists')
      .reply(200, zenkit.GET_LISTS_IN_WORKSPACE)
      .get('/api/v1/lists/1225299/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/1263156/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/1347812/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/1067607/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .post('/api/v1/lists/1225299/entries/filter')
      .reply(200, zenkit.TODO_ENTRIES_DATA)
      .post('/api/v1/lists/1067607/entries/filter')
      .reply(200, zenkit.TODO_ENTRIES_DATA)
      .post('/api/v1/lists/1263156/entries/filter')
      .reply(200, zenkit.SHOPPING_ENTRIES_DATA)
      .post('/api/v1/lists/1347812/entries/filter')
      .reply(200, zenkit.CUSTOM_ENTRIES_DATA)
      .post('/api/v1/lists/1263156/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)
      .post('/api/v1/lists/1347812/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY);

    nock('https://events.us-east-1.amazonaws.com')
      .persist()
      .filteringPath(function(path){
        return '/';
      })
      .post("/")
      .reply(200, {'Rules': [
        {'Arn': 'AlexaSyncSchedule' }
       ]})

    nock.emitter.on("no match", (req) => {
      console.log(req.path)
      console.log(req.method)
      assert(false, 'application failure: no match')
    })

    sinon.stub(DynamoDbPersistenceAdapter.prototype, 'saveAttributes').returns(true);
    sinon.stub(DynamoDbPersistenceAdapter.prototype, 'getAttributes')
      .withArgs(sinon.match( (args) => {
        if (args.context.System.user.userId == "amzn1.ask.account.time_test") {
          return true
        } else {
          return false
        };
      }))
      .returns({})
      .withArgs(sinon.match( (args) => {
        if (args.context.System.user.userId == "amzn1.ask.account.create_test") {
          return true
        } else {
          return false
        };
      }))
      .returns(req.GET_ATRTIBUTES_FOR_CREATE_ITEM);
    sinon.stub(DynamoDbPersistenceAdapter.prototype, 'deleteAttributes').returns(true);
  });

  describe("test zenkit --> alexa", () => {
    it('Try to create new item', async () => {
      var ctx = context();
      nock('https://todo.zenkit.com:443')
        .post('/api/v1/lists/1225299/entries', (body) => {
            console.log('todo item two created in zenkit');
            expect(body.sortOrder).to.equal('lowest');
            expect(body.displayString).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_text']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_searchText']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_textType']).to.equal('plain');
            return body
        })
        .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)

      nock('https://api.amazonalexa.com')
        .post('/v2/householdlists/todo_list_list_id/items/', (body) => {
          console.log('todo item one created in Alexa');
          expect(body.value).to.equal('todo item one');
          expect(body.status).to.equal('active');
          return body
        })
        .reply(200, { "id": 'todo_list_item_id',
          "value": 'todo item one',
          "status": 'active',
          "createdTime": 'Wed Sep 27 10:46:30 UTC 2017',
          "updatedTime": 'Wed Sep 27 10:46:30 UTC 2017'
        });

      index.handler(req.SYNC_MESSAGE_RECEIVED, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('created new item - Success!');
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
        });
      return true
    });
    it('Try to trigger Zenkit --> Alexa sync', async () => {
      var ctx = context();
      ddbStub = sinon.stub(AWS.DynamoDB.DocumentClient.prototype, 'scan')
        .returns({promise: function () {
          return Promise.resolve({Items:[
            {userId:'amzn1.ask.account.one'},
            {userId:'amzn1.ask.account.two'}
          ]});
        }})

      nock('https://api.amazon.com')
        .post('/auth/O2/token', (body) => {
            console.log('Retrieving token');
            expect(body.grant_type).to.equal('client_credentials');
            expect(body.scope).to.equal('alexa:skill_messaging');
            return body
          }
        )
        .times(2)
        .reply(200, {access_token:'test_access_token'})

       nock('https://api.amazonalexa.com')
        .post('/v1/skillmessages/users/amzn1.ask.account.one', (body) => {
          console.log('Creating sync message for amzn1.ask.account.one');
          expect(body.data.event).to.equal('updateAlexaList');
          return body
        })
        .reply(200)
        .post('/v1/skillmessages/users/amzn1.ask.account.two', (body) => {
          console.log('Creating sync message for amzn1.ask.account.two');
          expect(body.data.event).to.equal('updateAlexaList');
          return body
        })
        .reply(200)

      index.handler(req.SEND_SYNC_MESSAGE, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('created new item - Success!');
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
          
        });
      ddbStub.restore()
      return true
    });
    it('Try to trigger Zenkit --> Alexa sync with no to-do workspace', async() => {
      var ctx = context();
      nock('https://todo.zenkit.com:443')
        .post('/api/v1/lists/1225299/entries', (body) => {
            console.log('todo item two created in zenkit');
            expect(body.sortOrder).to.equal('lowest');
            expect(body.displayString).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_text']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_searchText']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_textType']).to.equal('plain');
            return body
        })
        .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)

      zenkitNock.interceptors.find(({ path }) => path == '/api/v1/users/me/workspacesWithLists').body = zenkit.ZENKIT_WORKSPACE_DATA_NO_TODO;

      index.handler(req.SYNC_MESSAGE_RECEIVED, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('created new item - Success!')
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
        });
      zenkitNock.interceptors.find(({ path }) => path == '/api/v1/users/me/workspacesWithLists').body = zenkit.ZENKIT_WORKSPACE_DATA;
      return true
    });
  });

  describe("test alexa --> zenkit", () => {
    it('Try to create new item in Zenkit from Alexa', async () => {
      var ctx = context();
      nock('https://todo.zenkit.com')
        .post('/api/v1/lists/1067607/entries', (body) => {
            console.log('todo item added created in Zenkit');
            expect(body.sortOrder).to.equal('lowest');
            expect(body.displayString).to.equal('todo item added');
            expect(body['febfd797-225d-48b4-8cec-61655c2cb240_text']).to.equal('todo item added');
            expect(body['febfd797-225d-48b4-8cec-61655c2cb240_searchText']).to.equal('todo item added');
            expect(body['febfd797-225d-48b4-8cec-61655c2cb240_textType']).to.equal('plain');
            return body
          }
        )
        .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)

      index.handler(req.ITEMS_CREATED_WITH_TOKEN, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('created new item in Zenkit from Alexa - Success!');
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
        });
      return true
    });

    it('Try to create new item in Zenkit from Alexa - with missing zenkit token', async () => {
      var ctx = context();
      nock('https://api.amazonalexa.com')
        .post('/v2/householdlists/todo_list_list_id/items/', (body) => {
          console.log('sync reminder created in Alexa');
          expect(body.value).to.equal('Zenkit Alexa Sync is not setup correctly! Go to https://www.amazon.com/dp/B087C8XQ3T and click on "Link Account"');
          expect(body.status).to.equal('active');
          return body
        })
        .reply(200, { "id": 'todo_list_list_id_missing',
          "value": 'Zenkit Alexa Sync is not setup correctly! Go to https://www.amazon.com/dp/B087C8XQ3T and click on "Link Account"',
          "status": 'active',
          "createdTime": 'Wed Sep 27 10:46:30 UTC 2017',
          "updatedTime": 'Wed Sep 27 10:46:30 UTC 2017'
        });

      index.handler(req.ITEMS_CREATED_WITH_MISSING_TOKEN, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('created sync reminder item in Alexa - Success!');
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
        });
      return true
    });
  });

  describe("test skill events", () => {
    it('Customer enabled the skill', async () => {
      var ctx = context();
      nock('https://todo.zenkit.com:443')
        .post('/api/v1/lists/1225299/entries', (body) => {
            console.log('todo item two created in zenkit');
            expect(body.sortOrder).to.equal('lowest');
            expect(body.displayString).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_text']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_searchText']).to.equal('todo item two');
            expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_textType']).to.equal('plain');
            return body
        })
        .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)

      nock('https://api.amazonalexa.com')
        .post('/v2/householdlists/todo_list_list_id/items/', (body) => {
          console.log('todo item one created in Alexa');
          expect(body.value).to.equal('todo item one');
          expect(body.status).to.equal('active');
          return body
        })
        .reply(200, { "id": 'todo_list_item_id',
          "value": 'todo item one',
          "status": 'active',
          "createdTime": 'Wed Sep 27 10:46:30 UTC 2017',
          "updatedTime": 'Wed Sep 27 10:46:30 UTC 2017'
        })

      index.handler(req.LINK_SKILL, ctx, (err, data) => { })
      await ctx.Promise
        .then(() => {
          console.log('Customer enabled the skill - Success!');
          
        })
        .catch(err => {
          assert(false, 'application failure:'.concat(err))
        });
      return true
    });
  });
});
