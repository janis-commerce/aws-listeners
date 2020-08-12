'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const S3Wrapper = require('../../../lib/s3/s3-wrapper/wrapper');

const S3 = require('../../../lib/s3/s3-wrapper');

const s3Params = {
	Bucket: 'test-bucket',
	Key: 'test.json'
};

describe('S3 Wrapper Test', () => {

	beforeEach(() => {
		this.s3 = sandbox.stub(S3Wrapper, 'getObject');
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should throw an error when S3 get object return an error', async () => {
		const message = 'Cannot get any object with the provided key';
		this.s3.returns({ promise: () => Promise.reject(new Error(message)) });

		assert.rejects(S3.get(s3Params), {
			name: 'Error',
			message
		});
	});

	it('Should return the S3 data object', async () => {

		const data = JSON.stringify({ test: 'this is some testing body' });

		const s3DataObject = {
			Body: data
		};
		this.s3.returns({ promise: () => Promise.resolve(s3DataObject) });

		const { Body } = await S3.get(s3Params);
		assert.deepStrictEqual(Body, data);
	});
});
