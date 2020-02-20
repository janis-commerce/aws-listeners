'use strict';

const S3Listener = require('./s3/s3-listener');
const ServerlessHandler = require('./s3/serverless/handler');

module.exports = {
	S3Listener,
	ServerlessHandler
};
