'use strict';

module.exports = Object.freeze({
  // Alexa
  ALEXA_SHOPPING_LIST: 'Alexa shopping list',
  ALEXA_TODO_LIST: 'Alexa to-do list',
  // ZenKit
  ZENKIT_SHOPPING_LIST: process.env.ZENKIT_SHOPPING_LIST || 'Shopping list',
  ZENKIT_TODO_LIST: process.env.ZENKIT_TODO_LIST || 'to-do',
  ZENKIT_INBOX_LIST: 'Inbox',
  // Skill
  SKILL_APP_ID: process.env.SKILL_APP_ID,
  SKILL_CLIENT_ID: process.env.SKILL_CLIENT_ID || 'test_id',
  SKILL_CLIENT_SECRET: process.env.SKILL_CLIENT_SECRET || 'test_secret',

  DDB_TABLE_NAME: 'AlexaSyncSettings'
});
