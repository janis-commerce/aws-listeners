'use strict';

const { S3Client, GetObjectCommand } = require('./wrapper');

exports.getObject = async params => {

	const { Body, ...response } = await S3Client.send(new GetObjectCommand(params));

	// An empty object has no Body: keep returning null. Stream read errors are NOT swallowed and will be thrown
	const bodyBuffered = Body ? Buffer.from(await Body.transformToByteArray()) : null;

	return {
		...response,
		Body: bodyBuffered
	};
};
