var assert = require('assert');
var expect = require('chai').expect;
const nock = require('nock');
var sinon = require('sinon');
const context = require('aws-lambda-mock-context');
const ctx = context({ timeout: 45 });
var index = require('../index');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

const req = require('./requestsTestData.js');
const alexa = require('./alexaTestData.js');
const zenkit = require('./zenkitTestData.js');

// https://sinonjs.org/how-to/stub-dependency/
describe("Testing the skill", function() {
  before(function() {
    nock('https://api.amazonalexa.com')
      .get('/v2/householdlists/')
      .reply(200, alexa.LISTS_DATA)
      .get('/v2/householdlists/todo_list_list_id/active/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id/completed/')
      .reply(200, alexa.EMPTY_TODO_LIST_DATA)
      .get('/v2/householdlists/shopping_list_list_id/active/')
      .reply(200, alexa.SHOPPING_LIST_DATA)
      .get('/v2/householdlists/shopping_list_list_id/completed/')
      .reply(200, alexa.EMPTY_SHOPPING_LIST_DATA)
      .get('/v2/householdlists/custom_list_list_id/active/')
      .reply(200, alexa.CUSTOM_LIST_DATA)
      .get('/v2/householdlists/custom_list_list_id/completed/')
      .reply(200, alexa.EMPTY_CUSTOM_LIST_DATA)
      .get('/v2/householdlists/todo_list_list_id/items/todo_list_item_id/')
      .reply(200, alexa.TODO_LIST_ITEM_DATA)
      .get('/v2/householdlists/todo_list_list_id/items/todo_list_item_added_id/')
      .reply(200, alexa.TODO_LIST_ITEM_ADDED_DATA);

    nock('https://todo.zenkit.com')
      .get('/api/v1/users/me/workspacesWithLists')
      .reply(200, zenkit.ZENKIT_WORKSPACE_DATA)
      .post('/api/v1/workspaces/442548/lists')
      .reply(200, zenkit.GET_LISTS_IN_WORKSPACE)
      .get('/api/v1/lists/rKFIotGNz/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/D3vxohN8O/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/AqIriYzgs/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .get('/api/v1/lists/rKFIotGNz/elements')
      .reply(200, zenkit.ELEMENTS_DATA)
      .post('/api/v1/lists/1225299/entries/filter')
      .reply(200, zenkit.TODO_ENTRIES_DATA)
      .post('/api/v1/lists/1263156/entries/filter')
      .reply(200, zenkit.SHOPPING_ENTRIES_DATA)
      .post('/api/v1/lists/1347812/entries/filter')
      .reply(200, zenkit.CUSTOM_ENTRIES_DATA)
      .post('/api/v1/lists/1263156/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)
      .post('/api/v1/lists/1347812/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY);

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

  });
  this.timeout(450);

  describe("test zenkit --> alexa", function() {

    it('created new item', (done) => {
      nock('https://todo.zenkit.com')
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
        .persist()
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

      index.handler(req.TIME_SYNC, ctx, (err, data) => { })
      ctx.Promise
        .then(() => {
          console.log('Success!');
          done();
        })
        .catch(err => {
          assert(false, err);
          done();
        });
    });
  });

  describe("test alexa --> zenkit", function() {
    it('created new item in Zenkit from Alexa', (done) => {
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
        //~ .post('/api/v1/lists/1263156/entries')
        //~ .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)
        //~ .post('/api/v1/lists/1347812/entries')
        //~ .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY);

      index.handler(req.ITEMS_CREATED_WITH_TOKEN, ctx, (err, data) => { })
      ctx.Promise
        .then(() => {
          console.log('Success!');
          done();
        })
        .catch(err => {
          assert(false, err);;
          done();
        });
    });
  });
  after(function () {
    nock.cleanAll();
  });
});
