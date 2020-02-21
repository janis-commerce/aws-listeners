'use strict';

require('lllog')('none');

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const CloudWatchLogs = require('../../../lib/modules/cloudwatch-logs/wrapper');

const CloudWatchLogsEvents = require('../../../lib/modules/cloudwatch-logs/events');

const { CLOUDWATCH_PREFIX } = process.env;

const now = Date.now();
const stringDate = new Date().toISOString();
const random = Math.random(10);

describe('Cloud Watch Logs Events Test', () => {

	beforeEach(() => {
		this.createLogStream = sandbox.stub(CloudWatchLogs, 'createLogStream');
		this.putLogEvents = sandbox.stub(CloudWatchLogs, 'putLogEvents');
		this.describeLogStreams = sandbox.stub(CloudWatchLogs, 'describeLogStreams');

		sandbox.stub(Date, 'now').returns(now);
		sandbox.stub(Date.prototype, 'toISOString').returns(stringDate);
		sandbox.stub(Math, 'random').returns(random);
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Should get log types', () => {
		assert.deepStrictEqual(CloudWatchLogsEvents.prototype.types, {
			1: 'INIT',
			2: 'REPORT',
			3: 'ERROR',
			4: 'STACK',
			5: 'END'
		});
	});

	it('Should get the log group name', () => {
		assert.deepStrictEqual(CloudWatchLogsEvents.prototype.logGroupName, `${CLOUDWATCH_PREFIX}/logs`);

		CloudWatchLogsEvents.prototype.groupName = 'tests';
		assert.deepStrictEqual(CloudWatchLogsEvents.prototype.logGroupName, `${CLOUDWATCH_PREFIX}/tests`);
	});

	it('Should get the log stream name', () => {

		const randomTest = random
			.toString()
			.slice(2);

		assert.deepStrictEqual(
			CloudWatchLogsEvents.prototype.logStreamName,
			`${stringDate.slice(0, 10)}-log-${now}${randomTest}`
		);

		// eslint-disable-next-line no-underscore-dangle
		delete CloudWatchLogsEvents.prototype._logStreamName;

		CloudWatchLogsEvents.prototype.streamName = 'test-testing-created';
		assert.deepStrictEqual(
			CloudWatchLogsEvents.prototype.logStreamName,
			`${stringDate.slice(0, 10)}-test-testing-created-${now}${randomTest}`
		);

		// Get the last logStreamName setted
		assert.deepStrictEqual(
			CloudWatchLogsEvents.prototype.logStreamName,
			`${stringDate.slice(0, 10)}-test-testing-created-${now}${randomTest}`
		);
	});

	it('Should return when messages are empty', async () => {
		await CloudWatchLogsEvents.prototype.log();
		await CloudWatchLogsEvents.prototype.log({});
		await CloudWatchLogsEvents.prototype.log([]);
	});

	// it('Should log an error when get sequence token throw an error', async () => {
	// 	const error = new Error('Cannot get any log');
	// 	this.describeLogStreams.returns({ promise: () => Promise.reject(error) });
	// 	await CloudWatchLogsEvents.prototype.log({ message: 'this is a test log' });

	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve() });
	// 	await CloudWatchLogsEvents.prototype.log({ message: 'this is a test log' });
	// });

	// it('Should log an error when get sequence token throw an error', async () => {
	// 	const error = new Error('Cannot get any log');
	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve({}) });
	// 	this.createLogStream.returns({ promise: () => Promise.reject(error) });

	// 	const logger = new CloudWatchLogsEvents();
	// 	await logger.log({ message: 'this is a test log' });

	// 	// eslint-disable-next-line no-underscore-dangle
	// 	logger._newStream = false;
	// 	await logger.log({ message: 'this is a test log' });

	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve({ logStreams: [] }) });
	// 	await logger.log({ message: 'this is a test log' });

	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve({ logStreams: [{ logStreamName: 'test' }] }) });
	// 	await logger.log({ message: 'this is a test log' });

	// 	// eslint-disable-next-line no-underscore-dangle
	// 	logger._logStreamName = 'test';
	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve({ logStreams: [{ logStreamName: 'test', uploadSequenceToken: 12345 }] }) });
	// 	await logger.log({ message: 'this is a test log' });
	// });

	// it('Should log an error when get sequence token throw an error', async () => {
	// 	const error = new Error('Cannot get any log');
	// 	this.describeLogStreams.returns({ promise: () => Promise.resolve({ logStreams: [{ logStreamName: 'test' }] }) });
	// 	this.createLogStream.returns({ promise: () => Promise.resolve() });
	// 	this.putLogEvents.returns({ promise: () => Promise.reject(error) });

	// 	const logger = new CloudWatchLogsEvents();
	// 	await logger.log([{ message: 'this is a test log' }]);

	// 	await logger.log('This is test a message log');
	// });

	it('Should pass through and set the sequence token', async () => {
		const nextSequenceToken = 12123213;
		this.describeLogStreams.returns({ promise: () => Promise.resolve({ logStreams: [{ logStreamName: 'test' }] }) });
		this.createLogStream.returns({ promise: () => Promise.resolve() });
		this.putLogEvents.returns({ promise: () => Promise.resolve({ nextSequenceToken }) });

		const logger = new CloudWatchLogsEvents();
		await logger.log({ test: { message: 'This is another prop of message' }, type: 2, duration: 10 });

		// eslint-disable-next-line no-underscore-dangle
		assert.deepStrictEqual(logger._sequenceToken, nextSequenceToken);

		// Props from cache
		await logger.log({ test: { message: 'This is another prop of message' }, type: 2, duration: 10 });
		// eslint-disable-next-line no-underscore-dangle
		assert.deepStrictEqual(logger._sequenceToken, nextSequenceToken);
	});
});
