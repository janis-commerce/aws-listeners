'use strict';

const assert = require('assert');
const { Readable } = require('stream');
const { mockClient } = require('aws-sdk-client-mock');

const { S3Client, GetObjectCommand } = require('../../lib/s3/s3-wrapper/wrapper');
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

describe('S3 Listener Test', () => {

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

	it('Should return the S3 data', async () => {

		const bodyReadable = new Readable();

		bodyReadable.push('<Binary String>');
		bodyReadable.push(null);

		this.s3ClientMock.on(GetObjectCommand).resolves(s3ParamsForGetObject);

		const s3Listener = new S3Listener(event);
		const getData = await s3Listener.getData();

		const bodyBuffered = Buffer.concat(await bodyReadable.toArray());

		assert.deepStrictEqual(getData, bodyBuffered);
		this.s3ClientMock.commandCalls(GetObjectCommand, s3ParamsForGetObject);
	});

	it('Should return the S3 data with empty body', async () => {

		const s3ParamsBodyEmpty = {
			...s3ParamsForGetObject,
			Body: undefined
		};

		this.s3ClientMock.on(GetObjectCommand).resolves(s3ParamsBodyEmpty);

		const s3Listener = new S3Listener(event);
		const getData = await s3Listener.getData();

		assert.deepStrictEqual(getData, null);
		this.s3ClientMock.commandCalls(GetObjectCommand, s3ParamsBodyEmpty);
	});

	it('Should return the S3 JSON data', async () => {

		const body = { test: 'testing' };
		const bodyReadableNew = new Readable();

		bodyReadableNew.push(JSON.stringify({ test: 'testing' }));
		bodyReadableNew.push(null);

		s3ParamsForGetObject = {
			...s3ParamsForGetObject,
			Body: bodyReadableNew
		};

		this.s3ClientMock.on(GetObjectCommand).resolves(s3ParamsForGetObject);

		const s3Listener = new S3Listener(jsonEvent);
		const getData = await s3Listener.getData();

		assert.deepStrictEqual(getData, body);
		this.s3ClientMock.commandCalls(GetObjectCommand, s3ParamsForGetObject);
	});
});
