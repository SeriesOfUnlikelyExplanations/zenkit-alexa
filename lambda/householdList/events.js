'use strict';

const AWS = require('aws-sdk');
// Set region to lambda function one (default: us-east-1)
AWS.config.update({region: process.env.AWS_REGION || 'us-east-1'});
// Create CloudWatchEvents service object
const cwevents = new AWS.CloudWatchEvents();
// Create Lambda service object
const lambda = new AWS.Lambda();
// Define event rule schedule name
const ruleName = 'AlexaSyncSchedule';

/**
 * List event rules
 * @return {Promise}
 */
function listRules(userId) {
  const params = {};
  return cwevents.listRules(params).promise();
}

/**
 * Create event rule schedule
 * @return {Promise}
 */
function createRule() {
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
function createTarget(functionArn, userId) {
  const params = {
    Rule: ruleName,
    Targets: [{
      Id: userId.substring(0,64),
      Arn: functionArn,
      Input: JSON.stringify({
        'source': 'aws.events',
        'type': 'skillMessaging',
        'message': {
          'event': 'updateAlexaList'
        },
        'userId': userId
      })
    }]
  };
  return cwevents.putTargets(params).promise();
}

/**
 * Delete event rule target
 * @return {Promise}
 */
function deleteTarget(userId) {
  const params = {
    Rule: ruleName,
    Ids: [userId.substring(0,64)]
  };
  return cwevents.removeTargets(params).promise();
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
  var rule = rules.Rules.find(rule => rule.Arn.includes("AlexaSyncSchedule"));
  if (!rule) {
    rule = await createRule();
    await addPermission(rule.RuleArn)
  }
  await createTarget(functionArn, userId)
}

/**
 * Delete event schedule
 * @return {Promise}
 */
async function deleteSchedule(userId) {
  await deleteTarget(userId)
}

module.exports = {
  createSchedule,
  deleteSchedule
};
