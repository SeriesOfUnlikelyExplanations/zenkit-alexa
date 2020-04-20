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
// Define event rule target id
const targetId = 'AlexaSyncTarget';

/**
 * Create event rule schedule
 * @return {Promise}
 */
function createRule(userId) {
  const params = {
    Name: ruleName + '_' + userId,
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
    Rule: ruleName + '_' + userId,
    Targets: [{
      Id: targetId,
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
 * Delete event rule schedule
 * @return {Promise}
 */
function deleteRule(userId) {
  const params = {
    Name: ruleName + '_' + userId
  };
  return cwevents.deleteRule(params).promise();
}

/**
 * Delete event rule target
 * @return {Promise}
 */
function deleteTarget(userId) {
  const params = {
    Rule: ruleName + '_' + userId,
    Ids: [targetId]
  };
  return cwevents.removeTargets(params).promise();
}

/**
 * Add event rule lambda permission
 * @param  {String} ruleArn
 * @return {Promise}
 */
function addPermission(ruleArn, userId) {
  const params = {
    Action: 'lambda:InvokeFunction',
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    Principal: 'events.amazonaws.com',
    StatementId: ruleName + '_' + userId,
    SourceArn: ruleArn
  };
  return lambda.addPermission(params).promise();
}

/**
 * Remote event rule lambda permission
 * @return {Promise}
 */
function removePermission(userId) {
  const params = {
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    StatementId: ruleName + '_' + userId
  };
  return lambda.removePermission(params).promise();
}

/**
 * Create event schedule
 * @param  {String} functionArn
 * @param  {String} userId
 * @return {Promise}
 */
async function createSchedule(functionArn, userId) {
  const response = await createRule(userId);
  await Promise.all([
    addPermission(response.RuleArn, userId),
    createTarget(functionArn, userId)
  ]);
}

/**
 * Delete event schedule
 * @return {Promise}
 */
async function deleteSchedule(userId) {
  await Promise.all([
    deleteTarget(userId),
    removePermission(userId)
  ]);
  await deleteRule(userId);
}

module.exports = {
  createSchedule,
  deleteSchedule
};
