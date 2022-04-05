'use strict';

const AWS = require('aws-sdk');
// Set region to lambda function one (default: us-east-1)
AWS.config.update({region: process.env.AWS_REGION || 'us-east-1'});
// Create CloudWatchEvents service object
const cwevents = new AWS.CloudWatchEvents();
// Create Lambda service object
const lambda = new AWS.Lambda();
// Create dynamodb client
var dynamodb = new AWS.DynamoDB.DocumentClient();
// Define event rule schedule name
const ruleName = 'AlexaSyncSchedule';
// Define event rule schedule name
const targetName = 'AlexaSyncTarget';

/**
 * List event rules
 * @return {Promise}
 */
function listRules() {
  const params = {};
  return cwevents.listRules(params).promise();
}

/**
 * Create event rule schedule
 * @return {Promise}
 */
function createRule(userId) {
  const params = {
    Name: ruleName,
    ScheduleExpression: 'rate(30 minutes)',
    State: 'ENABLED'
  };
  return cwevents.putRule(params).promise();
}

/**
 * Create event rule target
 * @param  {String} functionArn
 * @param  {String} userId
 * @return {Promise}
 */
function createTarget(functionArn) {
  const params = {
    Rule: ruleName,
    Targets: [{
      Id: targetName,
      Arn: functionArn,
      Input: JSON.stringify({
        'source': 'aws.events',
        'type': 'skillMessaging',
        'message': {
          'event': 'updateAlexaList'
        }
      })
    }]
  };
  return cwevents.putTargets(params).promise();
}

/**
 * Add event rule lambda permission
 * @param  {String} ruleArn
 * @return {Promise}
 */
function addPermission(ruleArn) {
  const params = {
    Action: 'lambda:InvokeFunction',
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    Principal: 'events.amazonaws.com',
    StatementId: ruleName,
    SourceArn: ruleArn
  };
  return lambda.addPermission(params).promise();
}

/**
 * Create event schedule
 * @param  {String} functionArn
 * @param  {String} userId
 * @return {Promise}
 */
async function createSchedule(functionArn, userId) {
  const rules = await listRules();
  var rule = rules.Rules.find(rule => rule.Arn.includes(ruleName));
  if (!rule) {
    rule = await createRule();
    await Promise.all([
      addPermission(rule.RuleArn),
      createTarget(functionArn, userId)
    ]);
  }
}

/**
 * return an array of users that need to be synced
 * @param  {String} ddbTableName
 * @return {Promise}
 */
async function getEventUsers(ddbTableName) {
  const params = {
    TableName: ddbTableName
  };
  return dynamodb.scan(params).promise()
    .then(function(res) {
      var response = [];
      res.Items.forEach((item) => {
        response.push(item.userId);
      });
      return response
    });
}

/**
 * Delete a specific user ID
 * @param  {String} ddbTableName
 * @return {Promise}
 */
async function deleteUser(userId, ddbTableName) {
  const params = {
    TableName: ddbTableName,
    Key: {
      userId: userId
    }
  };
  return dynamodb.delete(params).promise()
}

module.exports = {
  createSchedule,
  getEventUsers,
  deleteUser
};
