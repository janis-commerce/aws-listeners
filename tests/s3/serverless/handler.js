'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();
const logger = Object.getPrototypeOf(require('lllog')());

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
		sandbox.stub(logger, 'warn');
		sandbox.stub(Log, 'start');
		sandbox.stub(Events, 'emit').resolves();
		delete process.env.AWS_LAMBDA_REQUEST_ID;
		this.listenerTestProps = sandbox.stub(ListenerTest.prototype, 'setProps');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when s3 event is empty or invalid', async () => {
		await assert.rejects(S3ServerlessHandler.handle(ListenerTest), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, ''), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, {}), {
			name: 'S3ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});
	});

	it('Should throw and error when event Records are empty or not an array', async () => {
		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: '' }), {
			name: 'S3ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [] }), {
			name: 'S3ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});
	});

	it('Should throw an error when records does not have an s3 object or is invalid', async () => {
		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{}] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: {} }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { bucket: {} } }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		await assert.rejects(S3ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { object: {} } }] }), {
			name: 'S3ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});
	});

	it('Should throw an error when process is not found', async () => {

		const ListernerTestWithoutProcess = function() {};

		await assert.rejects(S3ServerlessHandler.handle(ListernerTestWithoutProcess, event), {
			name: 'S3ServerlessHandlerError',
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

		await assert.rejects(S3ServerlessHandler.handle(ListernerTestProcessError, event), {
			name: 'S3ServerlessHandlerError',
			code: 5,
			message: 'This is an error originated on listener process method',
			previousError: error
		});
	});

	it('Should process the event and set the properties to listener', async () => {

		await assert.doesNotReject(S3ServerlessHandler.handle(ListenerTest, event));

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

	describe('Event parsing', () => {

		const eventWithKey = (key, extra = {}) => ({
			Records: [{
				s3: {
					bucket: { name: 'janis-events-service-local' },
					object: { key, size: 10, eTag: 'tag' }
				}
			}],
			...extra
		});

		const getReceivedEvent = async (key, Records) => {
			const ev = eventWithKey(key);
			if(Records)
				ev.Records = Records;
			await S3ServerlessHandler.handle(ListenerTest, ev);
			return ListenerTest.prototype.setProps.firstCall.args[0]._event; // eslint-disable-line no-underscore-dangle
		};

		it('Should decode the key (plus signs and percent-encoding) and derive everything from it', async () => {

			const received = await getReceivedEvent('apps/picking/android/1.0.0.1/my+app%20%281%29.apk');

			assert.deepStrictEqual(received, {
				bucketName: 'janis-events-service-local',
				fileKey: 'apps/picking/android/1.0.0.1/my app (1).apk',
				fileName: 'my app (1)',
				filePrefix: 'apps/picking/android/1.0.0.1',
				fileExtension: 'apk',
				fileSize: 10,
				fileTag: 'tag'
			});
		});

		it('Should reject with INVALID_S3_RECORD when the key has a malformed percent-encoding', async () => {

			await assert.rejects(() => S3ServerlessHandler.handle(ListenerTest, eventWithKey('apps/100%.apk')), {
				name: 'S3ServerlessHandlerError',
				code: 3
			});

			sandbox.assert.calledOnceWithExactly(Events.emit, 'janiscommerce.ended');
		});

		it('Should use the last segment after the last dot as extension', async () => {

			const received = await getReceivedEvent('apps/app.v1.2.apk');

			assert.strictEqual(received.fileName, 'app.v1.2');
			assert.strictEqual(received.fileExtension, 'apk');
		});

		it('Should set the extension as undefined when the file has no dot', async () => {

			const received = await getReceivedEvent('file');

			assert.strictEqual(received.fileName, 'file');
			assert.strictEqual(received.fileExtension, undefined);
			assert.strictEqual(received.filePrefix, '');
		});

		it('Should treat a leading dot as part of the name (hidden file without extension)', async () => {

			const received = await getReceivedEvent('some/prefix/.hidden');

			assert.strictEqual(received.fileName, '.hidden');
			assert.strictEqual(received.fileExtension, undefined);
			assert.strictEqual(received.filePrefix, 'some/prefix');
		});

		it('Should not warn when there is only one record', async () => {

			await getReceivedEvent('file.txt');

			sandbox.assert.notCalled(logger.warn);
		});

		it('Should warn and process only the first record when more than one record is received', async () => {

			const [first] = eventWithKey('first.txt').Records;
			const [second] = eventWithKey('second.txt').Records;

			const received = await getReceivedEvent('unused', [first, second]);

			sandbox.assert.calledOnce(logger.warn);
			sandbox.assert.calledWithMatch(logger.warn, '2 records');
			sandbox.assert.calledOnce(ListenerTest.prototype.setProps);
			assert.strictEqual(received.fileKey, 'first.txt');
		});
	});

});
