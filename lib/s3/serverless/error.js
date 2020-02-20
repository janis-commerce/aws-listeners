'use strict';

class ServerlessHandlerError extends Error {

	constructor(err, code) {

		super(err.message || err);

		this.name = 'ServerlessHandlerError';
		this.code = code;

		if(typeof err !== 'string')
			this.previousError = err;
	}

	/**
	 * Serverless error codes
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessHandlerError
	 */
	static get codes() {
		return {
			INVALID_EVENT: 1,
			INVALID_RECORDS: 2,
			INVALID_S3_RECORD: 3,
			PROCESS_NOT_FOUND: 4,
			INTERNAL_ERROR: 5
		};
	}
}

module.exports = ServerlessHandlerError;
