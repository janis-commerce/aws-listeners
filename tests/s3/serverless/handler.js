'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const Log = require('@janiscommerce/log');
const Events = require('@janiscommerce/events');

const { S3ServerlessHandler, S3Listener } = require('../../../lib');

class ListenerTest extends S3Listener {
	async process() {
		this.setProps({ ...this });
	}

	setProps(props) {
		this._props = props;
	}
}

const event = {
	Records: [
		{
			s3: {
				s3SchemaVersion: '1.0',
				configurationId: 'testConfigId',
				bucket: {
					name: 'janis-events-service-local',
					ownerIdentity: { principalId: '25DF414140DB20' },
					arn: 'arn:aws:s3: : :janis-events-service-local'
				},
				object: {
					key: 'subscribers/test.json',
					sequencer: '16E051CDD44',
					size: 84,
					eTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b'
				}
			}
		}
	]
};

describe('Serverless Handler Test', () => {

	beforeEach(() => {
		sandbox.stub(Log, 'start');
		sandbox.stub(Events, 'emit').resolves();
		delete process.env.AWS_LAMBDA_REQUEST_ID;
		this.listenerTestProps = sandbox.stub(ListenerTest.prototype, 'setProps');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when s3 event is empty or invalid', () => {
		assert.rejects(S3ServerlessHandler.handle(ListenerTest), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, ''), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, {}), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});
	});

	it('Should throw and error when event Records are empty or not an array', () => {
		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: '' }), {
			name: 'S3ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [] }), {
			name: 'S3ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});
	});

	it('Should throw an error when records does not have an s3 object or is invalid', () => {
		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{}] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: {} }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { bucket: {} } }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { object: {} } }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});
	});

	it('Should throw an error when process is not found', () => {

		const ListernerTestWithoutProcess = function() {};

		assert.rejects(S3ServerlessHandler.handle(ListernerTestWithoutProcess, event), {
			name: 'S3ServerlessHandlerError',
			code: 4,
			message: 'Process method is required and must be a function'
		});
	});

	it('Should throw an error when process throws an error', () => {

		const error = new Error('This is an error originated on listener process method');

		const ListernerTestProcessError = function() {};
		ListernerTestProcessError.prototype.process = async function() {
			throw error;
		};

		assert.rejects(S3ServerlessHandler.handle(ListernerTestProcessError, event), {
			name: 'S3ServerlessHandlerError',
			code: 5,
			message: 'This is an error originated on listener process method',
			previousError: error
		});
	});

	it('Should process the event and set the properties to listener', () => {

		assert.doesNotReject(S3ServerlessHandler.handle(ListenerTest, event));

		sandbox.assert.calledOnce(ListenerTest.prototype.setProps);
		sandbox.assert.calledWithExactly(ListenerTest.prototype.setProps, {
			_event: {
				bucketName: 'janis-events-service-local',
				fileExtension: 'json',
				fileKey: 'subscribers/test.json',
				filePrefix: 'subscribers',
				fileTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b',
				fileName: 'test',
				fileSize: 84
			}
		});
	});

	describe('Invocation close', () => {

		const assertEnded = () => {
			sandbox.assert.calledOnceWithExactly(Events.emit, 'janiscommerce.ended');
		};

		it('Should start the log, set the request id and emit ended when the process is ok', async () => {

			await S3ServerlessHandler.handle(ListenerTest, event, { awsRequestId: 'request-id-1' });

			sandbox.assert.calledOnceWithExactly(Log.start);
			assert.strictEqual(process.env.AWS_LAMBDA_REQUEST_ID, 'request-id-1');
			assertEnded();
		});

		it('Should set an empty request id when no context is received', async () => {

			await S3ServerlessHandler.handle(ListenerTest, event);

			assert.strictEqual(process.env.AWS_LAMBDA_REQUEST_ID, '');
			assertEnded();
		});

		it('Should emit ended and propagate the error when process fails', async () => {

			const error = new Error('process error');

			const ListenerFail = function() {};
			ListenerFail.prototype.process = async function() {
				throw error;
			};

			await assert.rejects(S3ServerlessHandler.handle(ListenerFail, event, { awsRequestId: 'request-id-2' }), { code: 5, previousError: error });

			assertEnded();
		});

		it('Should start the log before validating, emit ended and propagate the error when the event is invalid', async () => {

			await assert.rejects(S3ServerlessHandler.handle(ListenerTest, {}, { awsRequestId: 'request-id-3' }), { code: 1 });

			sandbox.assert.calledOnce(Log.start);
			sandbox.assert.callOrder(Log.start, Events.emit);
			assertEnded();
		});
	});

});
