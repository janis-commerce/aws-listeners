'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { SQSListener, SQSServerlessHandler } = require('../../../lib');

const EventLogger = require('../../../lib/modules/log/event');

class ListenerTest extends SQSListener {
	setProps(props) {
		this._props = props;
	}
}

const event = {
	service: 'legacy',
	client: 'fizzmod',
	entity: 'order',
	event: 'new',
	id: '45'
};

const struct = {
	service: 'string&!empty',
	entity: 'string&!empty',
	event: 'string&!empty',
	client: 'string?|null?',
	id: 'string?|number?|null?'
};

const sqsMessage = {
	Records: [
		{
			messageId: '2b29fe49-36f9-433b-8431-210595fa0858',
			receiptHandle: '2b29fe49-36f9-433b-8431-210595fa0858#66e104e8-a72a-40e6-b793-9fd6b1f01de0',
			body: JSON.stringify(event),
			attributes: {},
			messageAttributes: {},
			md5OfBody: 'e659511be3f9908d4019bd93cd194a3f',
			eventSource: 'aws:sqs',
			eventSourceARN: 'arn:aws:sqs:region:XXXXXX:EventsMainQueueLocal',
			awsRegion: 'us-west-2'
		}
	]
};

const logId = '2019-11-22-legacy-order-null-15744013021390.477544306321267';

describe('SQS Serverless Handler Test', () => {

	beforeEach(() => {
		ListenerTest.prototype.struct = null;

		ListenerTest.prototype.process = async function process() {
			this.setProps({ ...this });
		};

		sandbox.stub(ListenerTest.prototype, 'setProps');
		sandbox.stub(EventLogger.prototype, 'log').returns(Promise.resolve());
		sandbox.stub(EventLogger.prototype, 'logStreamName').value(logId);

		sqsMessage.Records[0].messageAttributes = {};
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when receive invalid or empty event', () => {
		assert.rejects(SQSServerlessHandler.handle(ListenerTest), {
			name: 'SQSServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});
	});

	it('Should throw an error when listener is not a constructor', () => {
		assert.rejects(SQSServerlessHandler.handle({}, sqsMessage), {
			name: 'TypeError',
			message: 'Listener is not a constructor'
		});
	});

	it('Should throw an error when receive invalid message Records', () => {
		assert.rejects(SQSServerlessHandler.handle(ListenerTest, { test: 'test' }), {
			name: 'SQSServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});

		assert.rejects(SQSServerlessHandler.handle(ListenerTest, { Records: [] }), {
			name: 'SQSServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});
	});

	it('Should throw an error when receive invalid message Records body', () => {
		assert.rejects(SQSServerlessHandler.handle(ListenerTest, { Records: [{}] }), {
			name: 'SQSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});

		assert.rejects(SQSServerlessHandler.handle(ListenerTest, { Records: [{ body: '' }] }), {
			name: 'SQSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});

		assert.rejects(SQSServerlessHandler.handle(ListenerTest, { Records: [{ body: { test: 'test' } }] }), {
			name: 'SQSServerlessHandlerError',
			code: 3,
			message: 'Invalid message cannot parse the body from Records'
		});
	});

	it('Should throw an error when listener does not have process function or is invalid', () => {
		const listenerWithInvalidProcess = function() {};
		listenerWithInvalidProcess.prototype.logs = [];
		assert.rejects(SQSServerlessHandler.handle(listenerWithInvalidProcess, sqsMessage), {
			name: 'SQSServerlessHandlerError',
			code: 5,
			message: 'Process method is required and must be a function'
		});

		listenerWithInvalidProcess.prototype.process = 'test';
		assert.rejects(SQSServerlessHandler.handle(listenerWithInvalidProcess, sqsMessage), {
			name: 'SQSServerlessHandlerError',
			code: 5,
			message: 'Process method is required and must be a function'
		});
	});

	it('Should throw an error when listener validation throws an error', () => {
		ListenerTest.prototype.struct = { id: 'number' };

		assert.rejects(SQSServerlessHandler.handle(ListenerTest, sqsMessage), {
			name: 'SQSServerlessHandlerError',
			code: 5,
			message: 'Expected a value of type `undefined` for `client` but received `"fizzmod"`.'
		});
	});

	it('Should throw an error when listener process throws an error', () => {
		const error = new Error('Process fail');
		ListenerTest.prototype.process = () => { throw error; };

		assert.rejects(SQSServerlessHandler.handle(ListenerTest, sqsMessage), {
			name: 'SQSServerlessHandlerError',
			code: 5,
			message: 'Process fail',
			previousError: error
		});
	});

	it('Should does not throw errors when pass validation and the process is ok', async () => {

		sqsMessage.Records[0].messageAttributes.logId = logId;
		ListenerTest.prototype.struct = struct;

		await SQSServerlessHandler.handle(ListenerTest, sqsMessage);

		sandbox.assert.calledOnce(ListenerTest.prototype.setProps);
		sandbox.assert.calledWithExactly(ListenerTest.prototype.setProps, {
			_event: event,
			_logId: logId
		});
	});
});
