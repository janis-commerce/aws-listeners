'use strict';

const S3Listener = require('./s3/s3-listener');
const S3ServerlessHandler = require('./s3/serverless/handler');

const SNSListener = require('./sns/sns-listener');
const SNSServerlessHandler = require('./sns/serverless/handler');

const SQSListener = require('./sqs/sqs-listener');
const SQSServerlessHandler = require('./sqs/serverless/handler');

module.exports = {
	S3Listener,
	S3ServerlessHandler,
	SNSListener,
	SNSServerlessHandler,
	SQSListener,
	SQSServerlessHandler
};
