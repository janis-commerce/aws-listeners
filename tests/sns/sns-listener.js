'use strict';

// const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { SNSListener } = require('../../lib');

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
			Message: "{\"notificationType\":\"Bounce\",\"bounce\":{\"bounceType\":\"Permanent\",\"bounceSubType\":\"General\",\"bouncedRecipients\":[{\"emailAddress\":\"pablo.guzman@fizzmod.com\",\"action\":\"failed\",\"status\":\"5.1.1\",\"diagnosticCode\":\"smtp; 550-5.1.1 The email account that you tried to reach does not exist. Please try\\n550-5.1.1 double-checking the recipient's email address for typos or\\n550-5.1.1 unnecessary spaces. Learn more at\\n550 5.1.1  https://support.google.com/mail/?p=NoSuchUser u4si14420079qtd.257 - gsmtp\"}],\"timestamp\":\"2020-02-04T20:48:45.160Z\",\"feedbackId\":\"0100017011f66429-07b35c07-28bf-4f6c-a4de-092962178f3f-000000\",\"remoteMtaIp\":\"173.194.207.26\",\"reportingMTA\":\"dsn; a8-61.smtp-out.amazonses.com\"},\"mail\":{\"timestamp\":\"2020-02-04T20:45:40.000Z\",\"source\":\"no-reply@janisqa.in\",\"sourceArn\":\"arn:aws:ses:us-east-1:026813942644:identity/janisqa.in\",\"sourceIp\":\"52.70.66.172\",\"sendingAccountId\":\"026813942644\",\"messageId\":\"0100017011f39143-e945cb8f-0b46-41cb-9aa2-fe5247dc7a09-000000\",\"destination\":[\"pablo.guzman@fizzmod.com\",\"fernando.colom@fizzmod.com\"],\"headersTruncated\":false,\"headers\":[{\"name\":\"Received\",\"value\":\"from localhost.localdomain (ec2-52-70-66-172.compute-1.amazonaws.com [52.70.66.172]) by email-smtp.amazonaws.com with SMTP (SimpleEmailService-d-3KC9D75F2) id IMEdCVVuqfTAt270IB2O; Tue, 04 Feb 2020 20:45:40 +0000 (UTC)\"},{\"name\":\"Date\",\"value\":\"Tue, 4 Feb 2020 17:45:39 -0300\"},{\"name\":\"Return-Path\",\"value\":\"no-reply@janisqa.in\"},{\"name\":\"To\",\"value\":\"pablo.guzman@fizzmod.com\"},{\"name\":\"From\",\"value\":\"Janis QA <no-reply@janisqa.in>\"},{\"name\":\"Subject\",\"value\":\"[QA] Tu pedido fue facturado\"},{\"name\":\"Message-ID\",\"value\":\"<6812f63aa74da4af293d7eca2cad5c2b@localhost.localdomain>\"},{\"name\":\"X-Priority\",\"value\":\"3\"},{\"name\":\"X-Mailer\",\"value\":\"PHPMailer 5.0.0 (phpmailer.codeworxtech.com)\"},{\"name\":\"MIME-Version\",\"value\":\"1.0\"},{\"name\":\"Content-Type\",\"value\":\"multipart/alternative; boundary=\\\"b1_6812f63aa74da4af293d7eca2cad5c2b\\\"\"}],\"commonHeaders\":{\"returnPath\":\"no-reply@janisqa.in\",\"from\":[\"Janis QA <no-reply@janisqa.in>\"],\"date\":\"Tue, 4 Feb 2020 17:45:39 -0300\",\"to\":[\"pablo.guzman@fizzmod.com\"],\"messageId\":\"<6812f63aa74da4af293d7eca2cad5c2b@localhost.localdomain>\",\"subject\":\"[QA] Tu pedido fue facturado\"}}}", // eslint-disable-line
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

describe('SNS Listener Test', () => {

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the event pass through', () => {

		new SNSListener(event);

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
