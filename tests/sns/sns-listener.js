'use strict';

// const assert = require('assert');

const sandbox = require('sinon').createSandbox();

// const { SNSListener } = require('../../lib');

describe('SNS Listener Test', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the event pass through', () => {

		// new SNSListener(event);

		// const message = JSON.parse(event.Records[0].Sns.Message);
		// console.log('message:', message);
		// console.log('message:', message.bounce);
		// console.log('snsListener.type:', snsListener.type);
		// console.log('snsListener.type:', snsListener.type);
		// console.log('snsListener.notificationType:', snsListener.notificationType);
		// assert.deepStrictEqual(snsListener.notificationType, event.Records[0].Sns.notificationType);
		// assert.deepStrictEqual(snsListener.destinationRecipients, message.mail.destination);
		// assert.deepStrictEqual(snsListener.rejectedRecipients, message.bounce.bouncedRecipients);
		// assert.deepStrictEqual(snsListener.type, message.bounce.bounceType);
		// assert.deepStrictEqual(snsListener.subType, message.bounce.bounceSubType);
		// assert.deepStrictEqual(snsListener.mail, message.mail);
		// assert.deepStrictEqual(snsListener.sendingAccountId, message.mail.sendingAccountId);
		// assert.deepStrictEqual(snsListener.messageId, event.Records[0].Sns.MessageId);
	});
});
