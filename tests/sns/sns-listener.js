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

describe('SNS Listener Test', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the bounce message pass through', () => {

		const snsListener = new SNSListener(bounceEvent);

		assert.deepStrictEqual(snsListener.message, bounceEvent);
	});
});
