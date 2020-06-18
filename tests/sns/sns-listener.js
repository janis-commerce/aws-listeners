'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { SNSListener } = require('../../lib');

const bounceEvent = {
	notificationType: 'Bounce',
	bounce: {
		bounceType: 'Permanent',
		bounceSubType: 'General',
		bouncedRecipients: [{
			emailAddress: 'joe.doe@example.com',
			action: 'failed',
			status: '5.1.1',
			diagnosticCode: ''
		}],
		timestamp: '2020-02-04T20:48:45.160Z',
		feedbackId: '0100017011f66429-07b35c07-28bf-4f6c-a4de-092962178f3f-000000',
		remoteMtaIp: '173.194.207.26',
		reportingMTA: 'dsn; a8-61.smtp-out.amazonses.com'
	},
	mail: {
		timestamp: '2020-02-04T20:45:40.000Z',
		source: 'no-reply@example.com',
		sourceArn: 'arn:aws:ses:us-east-1:123456789100:identity/example.com',
		sourceIp: '50.70.50.70',
		sendingAccountId: '123456789100',
		messageId: '0100017011f39143-e945cb8f-0b46-41cb-9aa2-fe5247dc7a09-000000',
		destination: [
			'joe.doe@example.com',
			'john.doe@example.com'
		],
		headersTruncated: false,
		headers: [
			{
				name: 'Received',
				value: 'from localhost.localdomain'
			},
			{
				name: 'Date',
				value: 'Tue, 4 Feb 2020 17:45:39 -0300'
			},
			{
				name: 'Return-Path',
				value: 'no-reply@example.com'
			},
			{
				name: 'To',
				value: 'joe.doe@example.com'
			},
			{
				name: 'From',
				value: 'Example From <no-reply@example.com>'
			},
			{
				name: 'Subject',
				value: 'Subject from email'
			},
			{
				name: 'Message-ID',
				value: '<6812f63aa74da4af293d7eca2cad5c2b@localhost.localdomain>'
			},
			{
				name: 'X-Priority',
				value: '3'
			},
			{
				name: 'X-Mailer',
				value: 'PHPMailer 5.0.0 (phpmailer.codeworxtech.com)'
			},
			{
				name: 'MIME-Version',
				value: '1.0'
			},
			{
				name: 'Content-Type',
				value: 'multipart/alternative; boundary="b1_6812f63aa74da4af293d7eca2cad5c2b"'
			}
		],
		commonHeaders: {
			returnPath: 'no-reply@example.com',
			from: [
				'Example From <no-reply@example.com>'
			],
			date: 'Tue, 4 Feb 2020 17:45:39 -0300',
			to: [
				'joe.doe@example.com'
			],
			messageId: '<6812f63aaqwe23a4af293d7eca2cad5c2b@localhost.localdomain>',
			subject: 'subject of the email'
		}
	}
};

const emptyEvent = {
	complaint: {
		arrivalDate: '2016-01-27T14:59:38.237Z',
		feedbackId: '000001378603177f-18c07c78-fa81-4a58-9dd1-fedc3cb8f49a-000000',
		timestamp: '2016-01-27T14:59:38.237Z',
		userAgent: 'AnyCompany Feedback Loop (V0.01)'
	},
	mail: {
		commonHeaders: {
			date: 'Wed, 27 Jan 2016 14:05:45 +0000',
			from: [
				'John Doe <john@example.com>'
			],
			messageId: 'custom-message-ID',
			subject: 'Hello',
			to: [
				'Jane Doe <jane@example.com>, Mary Doe <mary@example.com>, Richard Doe <richard@example.com>'
			]
		},
		headers: [
			{
				name: 'From',
				value: '"John Doe" <john@example.com>'
			},
			{
				name: 'To',
				value: '"Jane Doe" <jane@example.com>, "Mary Doe" <mary@example.com>, "Richard Doe" <richard@example.com>'
			},
			{
				name: 'Message-ID',
				value: 'custom-message-ID'
			},
			{
				name: 'Subject',
				value: 'Hello'
			},
			{
				name: 'Content-Type',
				value: 'text/plain; charset="UTF-8"'
			},
			{
				name: 'Content-Transfer-Encoding',
				value: 'base64'
			},
			{
				name: 'Date',
				value: 'Wed, 27 Jan 2016 14:05:45 +0000'
			}
		],
		headersTruncated: false,
		messageId: '000001378603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000',
		sendingAccountId: '123456789012',
		source: 'john@example.com',
		sourceArn: 'arn:aws:ses:us-west-2:888888888888:identity/example.com',
		sourceIp: '127.0.3.0',
		timestamp: '2016-01-27T14:59:38.237Z'
	},
	notificationType: 'Complaint'
};

describe('SNS Listener Test', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the bounce event pass through', () => {

		const snsListener = new SNSListener(bounceEvent);

		assert.deepStrictEqual(snsListener.notificationType, bounceEvent.notificationType);
		assert.deepStrictEqual(snsListener.destinationRecipients, bounceEvent.mail.destination);
		assert.deepStrictEqual(snsListener.rejectedRecipients, bounceEvent.bounce.bouncedRecipients);
		assert.deepStrictEqual(snsListener.type, bounceEvent.bounce.bounceType);
		assert.deepStrictEqual(snsListener.subType, bounceEvent.bounce.bounceSubType);
		assert.deepStrictEqual(snsListener.mail, bounceEvent.mail);
		assert.deepStrictEqual(snsListener.sendingAccountId, bounceEvent.mail.sendingAccountId);
		assert.deepStrictEqual(snsListener.messageId, bounceEvent.mail.messageId);
	});

	it('Should return the properties inside the event pass through with default values with empty values', () => {

		const snsListener = new SNSListener(emptyEvent);

		assert.deepStrictEqual(snsListener.notificationType, emptyEvent.notificationType);
		assert.deepStrictEqual(snsListener.destinationRecipients, []);
		assert.deepStrictEqual(snsListener.rejectedRecipients, []);
		assert.deepStrictEqual(snsListener.type, null);
		assert.deepStrictEqual(snsListener.subType, null);
		assert.deepStrictEqual(snsListener.mail, emptyEvent.mail);
		assert.deepStrictEqual(snsListener.sendingAccountId, emptyEvent.mail.sendingAccountId);
		assert.deepStrictEqual(snsListener.messageId, emptyEvent.mail.messageId);
	});
});
