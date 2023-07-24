'use strict';

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const { IS_OFFLINE, S3_LOCAL_ENDPOINT } = process.env;

const localConfig = {
	s3ForcePathStyle: true,
	endpoint: S3_LOCAL_ENDPOINT || null,
	accessKeyId: 'S3RVER',
	secretAccessKey: 'S3RVER'
};

// Use the ignore because cannot change that process env globally
module.exports = {
	S3Client: /* istanbul ignore next */ IS_OFFLINE && S3_LOCAL_ENDPOINT ? /* istanbul ignore next */ new S3Client(localConfig) : new S3Client(),
	GetObjectCommand
};
