'use strict';

const S3Wrapper = require('./wrapper');

exports.get = (...args) => {
	return S3Wrapper
		.getObject(...args)
		.promise();
};
