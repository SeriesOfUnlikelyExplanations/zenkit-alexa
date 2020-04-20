'use strict';

const ZenKit = require('./zenKit.js');

const zenKitClient = new ZenKit(
      'https://base.zenkit.com/api/v1', 'k8xu76gb-lB5ya9YvHJLMUNcW7bU9J7X7jEbfNxbS');
const SyncListClient = require('../client.js');



zenKitClient.getListItems(1067633)
  .then(function(res) {
    console.log(res);
  })
zenKitClient.updateItemTitle(1067633, 53, 'b077f9c9-1730-4e7e-80cc-42376e8dcc2c', 'anal')
  .then(function(res) {
    console.log(res);
  });

// || 'k8xu76gb-lB5ya9YvHJLMUNcW7bU9J7X7jEbfNxbS'

// client id: e5c27a6f-c8f8-407a-b399-216f7d67aae1
//client secret: 8898ebf0ddc21a2b7fc991f931a81bbf39cab75b87c6b5ac
