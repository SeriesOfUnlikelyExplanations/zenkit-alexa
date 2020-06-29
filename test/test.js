var assert = require('assert');
var expect = require('chai').expect;
const nock = require('nock');
const context = require('aws-lambda-mock-context');
const ctx = context({ timeout: 45 });
var index = require('../lambda/householdlist/index');

const req = require('./requestsTestData.js');
const alexa = require('./alexaTestData.js');
const zenkit = require('./zenkitTestData.js');

// https://www.npmjs.com/package/aws-sdk-mock
describe("Testing the skill", function() {
  before(() => {
    // mock read AWS dynamo response
    var AWSmock = require('aws-sdk-mock');
    var AWS = require('aws-sdk');
    AWSmock.setSDKInstance(AWS);
    AWSmock.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
      callback(null, response);
    });
  });
  this.timeout(45000);
  const alexaNock = nock('https://api.amazonalexa.com')
    .get('/v2/householdlists/')
    .reply(200, alexa.LISTS_DATA)
    .get('/v2/householdlists/todo_list_list_id/active/')
    .reply(200, alexa.TODO_LIST_DATA)
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
    .reply(200, alexa.EMPTY_CUSTOM_LIST_DATA)

  const zenkitNock = nock('https://todo.zenkit.com')
    .get('/api/v1/users/me/workspacesWithLists')
    .reply(200, zenkit.ZENKIT_WORKSPACE_DATA)
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

  it('created new item', (done) => {
    const zenkitExpectedNock = nock('https://todo.zenkit.com')
      .post('/api/v1/lists/1225299/entries'
        , function (body) {
        expect(body.sortOrder).to.equal('lowest');
        expect(body.displayString).to.equal('todo item two');
        expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_text']).to.equal('todo item two');
        expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_searchText']).to.equal('todo item two');
        expect(body['bdbcc0f2-9dda-4381-8dd7-05b782dd6722_textType']).to.equal('plain');
        return body
      })
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)
      .post('/api/v1/lists/1263156/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY)
      .post('/api/v1/lists/1347812/entries')
      .reply(200, zenkit.CREATE_SHOPPING_ENTRY_REPLY);

    const alexaExpectedNock = nock('https://api.amazonalexa.com')
      .persist()
      .post('/v2/householdlists/shopping_list_list_id/items/', (body) => {
        expect(body.sortOrder).to.equal('todo');
        return body
      })
      .reply(200);
    //~ AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
      //~ callback(null, "successfully put item in database");
    //~ });
    //~ AWS.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
      //~ callback(null, 'success');
    //~ });
    index.handler(req.TIME_SYNC, ctx, (err, data) => { })
    ctx.Promise
      .then(() => {
        console.log('Success!');
        done();
        nock.cleanAll();
      })
      .catch(err => {
        assert(false, err);;
        nock.cleanAll();
        AWS.restore();
        done();
      });
  });

})
