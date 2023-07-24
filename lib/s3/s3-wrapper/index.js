'use strict';

const { S3Client, GetObjectCommand } = require('./wrapper');

exports.getObject = async params => {
	console.log('params:', params);
	const a = await S3Client.send(new GetObjectCommand(params));
	console.log('a:', a);
	return;
	// const { Body, ...response } = await S3Client.send(new GetObjectCommand(params));
	console.log('Body:', Body);
	console.log('response:', response);
	let bodyBuffered;

	try {
		// BODY is Readable type; since Node 17+ can convert this new type using Readable.toArray API and Buffer.concat
		bodyBuffered = Buffer.concat(await Body.toArray());

	} catch(error) {
		// If Body is empty will throw;
		bodyBuffered = null;
	}

	return {
		...response,
		Body: bodyBuffered
	};
};
