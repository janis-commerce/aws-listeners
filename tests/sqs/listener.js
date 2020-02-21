'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { SQSListener } = require('../../lib');

const struct = {
	service: 'string&!empty',
	entity: 'string&!empty',
	event: 'string&!empty',
	client: 'string?|null?',
	id: 'string?|number?|null?'
};

const event = {
	service: 'legacy',
	client: 'fizzmod',
	entity: 'order',
	event: 'new',
	id: '45'
};

const logId = '2019-11-22-legacy-order-null-15744013021390.477544306321267';

const date = Date.now();

describe('SQS Listener Test', () => {

	beforeEach(() => {
		sandbox.stub(Date, 'now').returns(date);
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the event', () => {
		const sqsListener = new SQSListener(event);
		assert.deepStrictEqual(sqsListener.event, event);
	});

	it('Should throw an error when validate and event is invalid', () => {
		const sqsListener = new SQSListener({ ...event, service: null });
		sqsListener.struct = struct;
		try {
			sqsListener.validate();
		} catch({ name, message: errMsg }) {
			assert.deepStrictEqual(name, 'StructValidationError');
			assert.deepStrictEqual(errMsg, 'Expected a value of type `string & !empty` for `service` but received `null`.');
		}
	});

	it('Should pass validation', () => {
		const sqsListener = new SQSListener(event);
		sqsListener.struct = struct;
		sqsListener.validate();
	});

	it('Should return an array with the added logs', () => {
		const sqsListener = new SQSListener(event);
		sqsListener.struct = struct;
		sqsListener.validate();

		assert.deepStrictEqual(sqsListener.logs, []);

		sqsListener.addLog({ message: 'This is a test log' });
		sqsListener.addLog({ message: 'This is a another test log' });

		assert.deepStrictEqual(sqsListener.logs, [
			{
				name: sqsListener.constructor.name,
				type: 2,
				createdAt: date,
				message: 'This is a test log'
			},
			{
				name: sqsListener.constructor.name,
				type: 2,
				createdAt: date,
				message: 'This is a another test log'
			}
		]);
	});

	it('Should return the message attributes with and without logId', () => {
		const sqsListenerWithoutLogId = new SQSListener(event);
		assert.deepStrictEqual(sqsListenerWithoutLogId.attributes, { MessageAttributes: {} });

		const sqsListenerWithLogId = new SQSListener(event, logId);
		assert.deepStrictEqual(sqsListenerWithLogId.attributes, { MessageAttributes: { logId: { DataType: 'String',	StringValue: logId } } });
	});
});
