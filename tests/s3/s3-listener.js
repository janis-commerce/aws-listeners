'use strict';

const assert = require('assert');
const sandbox = require('sinon');
const { Readable } = require('stream');
const { mockClient } = require('aws-sdk-client-mock');

const S3 = require('../../lib/s3/s3-wrapper');
const s3Wrapper = require('../../lib/s3/s3-wrapper/wrapper');

const {
	S3Client,
	GetObjectCommand
} = s3Wrapper;

const { S3Listener } = require('../../lib');

const event = {
	bucketName: 'test-bucket',
	fileKey: 'testing/test.txt',
	fileName: 'test',
	filePrefix: 'testing',
	fileSize: 80,
	fileExtension: 'txt',
	fileTag: 'f5edbddec6fc3d3a7fabe0e4c14d474b'
};

const jsonEvent = { ...event, fileKey: 'testing/test.json', fileExtension: 'json' };

describe.only('S3 Listener Test', () => {

	let s3ParamsForGetObject;

	beforeEach(() => {
		const bodyReadable = new Readable();

		bodyReadable.push('<Binary String>');
		bodyReadable.push(null);

		s3ParamsForGetObject = {
			Body: bodyReadable,
			Bucket: 'examplebucket',
			Key: 'objectkey'
		};
		console.log('s3ParamsForGetObject:', s3ParamsForGetObject);
		this.s3ClientMock = mockClient(S3Client);
	});

	afterEach(() => this.s3ClientMock.reset());

	it('Should return the properties inside the event pass through', () => {

		const s3Listener = new S3Listener(event);

		assert.deepStrictEqual(s3Listener.bucketName, event.bucketName);
		assert.deepStrictEqual(s3Listener.fileKey, event.fileKey);
		assert.deepStrictEqual(s3Listener.fileName, event.fileName);
		assert.deepStrictEqual(s3Listener.filePrefix, event.filePrefix);
		assert.deepStrictEqual(s3Listener.fileSize, event.fileSize);
		assert.deepStrictEqual(s3Listener.fileExtension, event.fileExtension);
		assert.deepStrictEqual(s3Listener.fileTag, event.fileTag);
	});

	it.only('Should return the S3 data', async () => {

		const bodyReadable = new Readable();

		bodyReadable.push('<Binary String>');
		bodyReadable.push(null);

		const s3Listener = new S3Listener(event);
		const getData = await s3Listener.getData();

		this.s3ClientMock.on(GetObjectCommand).resolves(s3ParamsForGetObject);

		const getObjectInstance = await S3.getObject(s3ParamsForGetObject);

		const bodyBuffered = Buffer.concat(await bodyReadable.toArray());
		console.log('bodyBuffered:', bodyBuffered);
		// assert.deepStrictEqual(getData, bodyBuffered);
		assert.deepStrictEqual(getObjectInstance, {
			...s3ParamsForGetObject,
			Body: bodyBuffered
		});

		sandbox.assert.calledOnceWithExactly(getObjectInstance, { Bucket: event.bucketName, Key: event.fileKey });
	});

	it('Should return the S3 JSON data', async () => {
		const body = { test: 'testing' };
		this.S3.returns(Promise.resolve({ Body: JSON.stringify(body) }));

		const s3Listener = new S3Listener(jsonEvent);
		const getData = await s3Listener.getData();

		assert.deepStrictEqual(getData, body);

		sandbox.assert.calledOnceWithExactly(S3.get, { Bucket: event.bucketName, Key: jsonEvent.fileKey });
	});
});
