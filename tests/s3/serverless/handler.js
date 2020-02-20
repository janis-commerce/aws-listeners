'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { ServerlessHandler, S3Listener } = require('../../../lib');

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
		this.listenerTestProps = sandbox.stub(ListenerTest.prototype, 'setProps');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when s3 event is empty or invalid', () => {
		assert.rejects(ServerlessHandler.handle(ListenerTest), {
			name: 'ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, ''), {
			name: 'ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, {}), {
			name: 'ServerlessHandlerError',
			code: 1,
			message: 'Event cannot be empty and must be an object'
		});
	});

	it('Should throw and error when event Records are empty or not an array', () => {
		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: '' }), {
			name: 'ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: [] }), {
			name: 'ServerlessHandlerError',
			code: 2,
			message: 'Event Records cannot be empty and must be an array'
		});
	});

	it('Should throw an error when records does not have an s3 object or is invalid', () => {
		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: [{}] }), {
			name: 'ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: [{ s3: {} }] }), {
			name: 'ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { bucket: {} } }] }), {
			name: 'ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});

		assert.rejects(ServerlessHandler.handle(ListenerTest, { Records: [{ s3: { object: {} } }] }), {
			name: 'ServerlessHandlerError',
			code: 3,
			message: 'Cannot get the S3 event from Records'
		});
	});

	it('Should throw an error when process is not found', () => {

		const ListernerTestWithoutProcess = function() {};

		assert.rejects(ServerlessHandler.handle(ListernerTestWithoutProcess, event), {
			name: 'ServerlessHandlerError',
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

		assert.rejects(ServerlessHandler.handle(ListernerTestProcessError, event), {
			name: 'ServerlessHandlerError',
			code: 5,
			message: 'This is an error originated on listener process method',
			previousError: error
		});
	});

	it('Should process the event and set the properties to listener', () => {

		assert.doesNotReject(ServerlessHandler.handle(ListenerTest, event));

		sandbox.assert.calledOnce(ListenerTest.prototype.setProps);
		sandbox.assert.calledWithExactly(ListenerTest.prototype.setProps, {
			_event: {
				bucketName: 'janis-events-service-local',
				fileExtention: 'json',
				fileKey: 'subscribers/test.json',
				filePrefix: 'subscribers',
				fileTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b',
				filename: 'test',
				filesize: 84
			}
		});
	});

});
