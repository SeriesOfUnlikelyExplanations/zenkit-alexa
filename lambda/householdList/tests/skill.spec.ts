import {AlexaTest, IntentRequestBuilder, LaunchRequestBuilder, SkillSettings} from 'ask-sdk-test';
import {handler as skillHandler} from './helloworld';

// initialize the testing framework
const skillSettings : SkillSettings = {
    appId: 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000',
    userId: 'amzn1.ask.account.VOID',
    deviceId: 'amzn1.ask.device.VOID',
    locale: 'en-US',
};

const alexaTest = new AlexaTest(skillHandler, skillSettings);

describe('LaunchRequest', () => {
    alexaTest.test([
        {
            request: new LaunchRequestBuilder(skillSettings).build(),
            says: 'Welcome to the Alexa Skills Kit, you can say hello!',
            repromptsNothing: true,
            shouldEndSession: true,
        },
    ]);
});
