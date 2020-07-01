'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { SNSListener } = require('../../lib');

const bounceEvent = {
	bounce: {
		bounceSubType: 'General',
		bounceType: 'Permanent',
		bouncedRecipients: [{
			action: 'failed',
			diagnosticCode: 'smtp; 550-5.1.1 The email account that you tried to reach does not exist.',
			emailAddress: 'pablo.guzman@fizzmod.com',
			status: '5.1.1'
		}],
		feedbackId: '0100017011f66429-07b35c07-28bf-4f6c-a4de-092962178f3f-000000',
		remoteMtaIp: '173.194.207.26',
		reportingMTA: 'dsn; a8-61.smtp-out.amazonses.com',
		timestamp: '2020-02-04T20:48:45.160Z'
	},
	mail: {
		commonHeaders: {
			date: 'Tue, 4 Feb 2020 17:45:39 -0300',
			from: [
				'Janis QA <no-reply@janisqa.in>'
			],
			messageId: '<6812f63aa74da4af293d7eca2cad5c2b@localhost.localdomain>',
			returnPath: 'no-reply@janisqa.in',
			subject: '[QA] Tu pedido fue facturado',
			to: [
				'pablo.guzman@fizzmod.com'
			]
		},
		destination: [
			'pablo.guzman@fizzmod.com',
			'fernando.colom@fizzmod.com'
		],
		headers: [
			{
				name: 'Received',
				value: 'from localhost.localdomain '
			},
			{
				name: 'Date',
				value: 'Tue, 4 Feb 2020 17:45:39 -0300'
			},
			{
				name: 'Return-Path',
				value: 'no-reply@janisqa.in'
			},
			{
				name: 'To',
				value: 'pablo.guzman@fizzmod.com'
			},
			{
				name: 'From',
				value: 'Janis QA <no-reply@janisqa.in>'
			},
			{
				name: 'Subject',
				value: '[QA] Tu pedido fue facturado'
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
		headersTruncated: false,
		messageId: '0100017011f39143-e945cb8f-0b46-41cb-9aa2-fe5247dc7a09-000000',
		sendingAccountId: '026813942644',
		source: 'no-reply@janisqa.in',
		sourceArn: 'arn:aws:ses:us-east-1:026813942644:identity/janisqa.in',
		sourceIp: '52.70.66.172',
		timestamp: '2020-02-04T20:45:40.000Z'
	},
	notificationType: 'Bounce'
};

describe('SNS Listener Test', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the bounce event pass through', () => {

		const snsListener = new SNSListener(bounceEvent);

		assert.deepStrictEqual(snsListener.event, bounceEvent);
	});
});
