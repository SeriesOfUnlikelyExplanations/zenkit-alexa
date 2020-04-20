'use strict';

module.exports = Object.freeze({
  // Alexa
  ALEXA_API_URL: process.env.ALEXA_API_URL || 'https://api.amazonalexa.com',
  ALEXA_SHOPPING_LIST: process.env.ALEXA_SHOPPING_LIST || 'Alexa shopping list',
  // ZenKit
  ZENKIT_API_URL: process.env.OUR_GROCERIES_API_URL || 'https://base.zenkit.com/api/v1',
  ZENKIT_API_KEY: process.env.ZENKIT_API_KEY || 'k8xu76gb-lB5ya9YvHJLMUNcW7bU9J7X7jEbfNxbS', // TODO: delete this and reset it.
  ZENKIT_SHOPPING_LIST: process.env.ZENKIT_SHOPPING_LIST || 'Shopping list',
  ZENKIT_TODO_LIST: process.env.ZENKIT_TODO_LIST || 'Inbox',
  // Skill
  SKILL_APP_ID: process.env.SKILL_APP_ID,
  SKILL_CLIENT_ID: process.env.SKILL_CLIENT_ID,
  SKILL_CLIENT_SECRET: process.env.SKILL_CLIENT_SECRET,
});
