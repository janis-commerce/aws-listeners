'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();

const { SNSServerlessHandler, SNSListener } = require('../../../lib');

class SNSListenerTest extends SNSListener {
	async process() {
		this.setProps({ ...this });
	}

	setProps(props) {
		this._props = props;
	}
}

const event = {
	Records: [{
		EventSource: 'aws:sns',
		EventVersion: '1.0',
		EventSubscriptionArn: 'arn:aws:sns:us-east-1:026813942644:SESNotifications:d865d97a-51ce-4172-8ba4-d2dbdd993e65',
		Sns: {
			Type: 'Notification',
			MessageId: '80598bda-5695-503d-992f-dd698c785f71',
			TopicArn: 'arn:aws:sns:us-east-1:026813942644:SESNotifications',
			Subject: null,
			Message: "{\"notificationType\":\"Bounce\",\"bounce\":{\"bounceType\":\"Permanent\",\"bounceSubType\":\"General\",\"bouncedRecipients\":[{\"emailAddress\":\"joe.doe@example.com\",\"action\":\"failed\",\"status\":\"5.1.1\",\"diagnosticCode\":\"\"}],\"timestamp\":\"2020-02-04T20:48:45.160Z\",\"feedbackId\":\"0100017011f66429-07b35c07-28bf-4f6c-a4de-092962178f3f-000000\",\"remoteMtaIp\":\"173.194.207.26\",\"reportingMTA\":\"dsn; a8-61.smtp-out.amazonses.com\"},\"mail\":{\"timestamp\":\"2020-02-04T20:45:40.000Z\",\"source\":\"no-reply@example.com\",\"sourceArn\":\"arn:aws:ses:us-east-1:123456789100:identity/example.com\",\"sourceIp\":\"50.70.50.70\",\"sendingAccountId\":\"123456789100\",\"messageId\":\"0100017011f39143-e945cb8f-0b46-41cb-9aa2-fe5247dc7a09-000000\",\"destination\":[\"joe.doe@example.com\",\"john.doe@example.com\"],\"headersTruncated\":false,\"headers\":[{\"name\":\"Received\",\"value\":\"from localhost.localdomain\"},{\"name\":\"Date\",\"value\":\"Tue, 4 Feb 2020 17:45:39 -0300\"},{\"name\":\"Return-Path\",\"value\":\"no-reply@example.com\"},{\"name\":\"To\",\"value\":\"joe.doe@example.com\"},{\"name\":\"From\",\"value\":\"Example From <no-reply@example.com>\"},{\"name\":\"Subject\",\"value\":\"Subject from email\"},{\"name\":\"Message-ID\",\"value\":\"<6812f63aa74da4af293d7eca2cad5c2b@localhost.localdomain>\"},{\"name\":\"X-Priority\",\"value\":\"3\"},{\"name\":\"X-Mailer\",\"value\":\"PHPMailer 5.0.0 (phpmailer.codeworxtech.com)\"},{\"name\":\"MIME-Version\",\"value\":\"1.0\"},{\"name\":\"Content-Type\",\"value\":\"multipart/alternative; boundary=\\\"b1_6812f63aa74da4af293d7eca2cad5c2b\\\"\"}],\"commonHeaders\":{\"returnPath\":\"no-reply@example.com\",\"from\":[\"Example From <no-reply@example.com>\"],\"date\":\"Tue, 4 Feb 2020 17:45:39 -0300\",\"to\":[\"joe.doe@example.com\"],\"messageId\":\"<6812f63aaqwe23a4af293d7eca2cad5c2b@localhost.localdomain>\",\"subject\":\"subject of the email\"}}}", // eslint-disable-line
			Timestamp: '2020-02-04T20:48:45.210Z',
			SignatureVersion: '1',
			Signature: `JU2Cs8rQpJvQ5Zc27L6bwzASGabc4wmY6BSb7LmVcR0U5UwqPOQJlZx8qVrgBdtj/
				EXQvhXCSKfwcpVpmA3jYvBNUg6iB7GVgpKA3SEoSnu13i1ZiVAVNqDyv2HhXGWdvbx
				T1W1oNjgXRex2fjX61J0Bu6M1hH5GufXaW4qgfIJ9sleOpVrNxbxqvDedc1HxZ9PJ89L9kWkEEf03ZEq/
				e/dHS8C0MnhxIcUL+CTx6RqesnUTdDDYtp0jn1s8gsbLs2vOr7qWLG+0jUgI3xyi+jMxoVx/cjtXIw3aVG2ASrTlBoDUC2zwrS/vm8tzK+oxgrpA62U3uVsUvLypFAjcVA==`,
			SigningCertUrl: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
			UnsubscribeUrl: `https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=
				arn:aws:sns:us-east-1:026813942644:SESNotifications:d865d97a-51ce-4172-8ba4-d2dbdd993e65`,
			MessageAttributes: {}
		}
	}]
};

describe('Serverless Handler Test', () => {

	beforeEach(() => {
		this.listenerTestProps = sandbox.stub(SNSListenerTest.prototype, 'setProps');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when sns event is empty or invalid', () => {
		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest), {
			name: 'SNSServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, ''), {
			name: 'SNSServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, {}), {
			name: 'SNSServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});
	});

	it('Should throw and error when event Records are empty or not an array', () => {
		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: '' }), {
			name: 'SNSServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: [] }), {
			name: 'SNSServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});
	});

	it('Should throw an error when records does not have an sns object or is invalid', () => {
		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: [{}] }), {
			name: 'SNSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: [{ sns: {} }] }), {
			name: 'SNSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: [{ sns: { bucket: {} } }] }), {
			name: 'SNSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});

		assert.rejects(SNSServerlessHandler.handle(SNSListenerTest, { Records: [{ sns: { object: {} } }] }), {
			name: 'SNSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});
	});

	it('Should throw an error when process is not found', () => {

		const ListernerTestWithoutProcess = function() {};

		assert.rejects(SNSServerlessHandler.handle(ListernerTestWithoutProcess, event), {
			name: 'SNSServerlessHandlerError',
			code: 4,
			message: 'Process method is required and must be a function'
		});
	});

	it('Should throw an error when process throws an error', async () => {

		const error = new Error('This is an error originated on listener process method');

		const ListernerTestProcessError = function() {};
		ListernerTestProcessError.prototype.process = async function() {
			throw error;
		};

		await assert.rejects(SNSServerlessHandler.handle(ListernerTestProcessError, event), {
			name: 'SNSServerlessHandlerError',
			code: 5,
			message: 'This is an error originated on listener process method',
			previousError: error
		});
	});

	it('Should process the event and set the properties to listener', () => {

		assert.doesNotReject(SNSServerlessHandler.handle(SNSListenerTest, event));

		sandbox.assert.calledOnce(SNSListenerTest.prototype.setProps);
		sandbox.assert.calledWithExactly(SNSListenerTest.prototype.setProps, {
			_event: {
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
			}
		});
	});

});
