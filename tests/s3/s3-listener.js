'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const S3 = require('../../lib/s3/s3-wrapper');

const { S3Listener } = require('../../lib');

const event = {
	bucketName: 'test-bucket',
	fileKey: 'testing/test.txt',
	filename: 'test',
	filePrefix: 'testing',
	filesize: 80,
	fileExtention: 'txt',
	fileTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b'
};

const jsonEvent = { ...event, fileKey: 'testing/test.json', fileExtention: 'json' };

describe('S3 Listener Test', () => {

	beforeEach(() => {
		this.S3 = sandbox.stub(S3, 'get');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should return the properties inside the event pass through', () => {
		const s3Listener = new S3Listener(event);

		assert.deepStrictEqual(s3Listener.bucketName, event.bucketName);
		assert.deepStrictEqual(s3Listener.fileKey, event.fileKey);
		assert.deepStrictEqual(s3Listener.filename, event.filename);
		assert.deepStrictEqual(s3Listener.filePrefix, event.filePrefix);
		assert.deepStrictEqual(s3Listener.filesize, event.filesize);
		assert.deepStrictEqual(s3Listener.fileExtention, event.fileExtention);
		assert.deepStrictEqual(s3Listener.fileTag, event.fileTag);
	});

	it('Should return the S3 data', async () => {
		const body = 'This is a testing data';
		this.S3.returns(Promise.resolve({ Body: body }));

		const s3Listener = new S3Listener(event);
		const getData = await s3Listener.getData();

		assert.deepStrictEqual(getData, body);

		sandbox.assert.calledOnce(S3.get);
		sandbox.assert.calledWithExactly(S3.get, { Bucket: event.bucketName, Key: event.fileKey });
	});

	it('Should return the S3 JSON data', async () => {
		const body = { test: 'testing' };
		this.S3.returns(Promise.resolve({ Body: JSON.stringify(body) }));

		const s3Listener = new S3Listener(jsonEvent);
		const getData = await s3Listener.getData();

		assert.deepStrictEqual(getData, body);

		sandbox.assert.calledOnce(S3.get);
		sandbox.assert.calledWithExactly(S3.get, { Bucket: event.bucketName, Key: jsonEvent.fileKey });
	});
});
