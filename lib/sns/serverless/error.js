'use strict';

class SNSServerlessHandlerError extends Error {

	constructor(err, code) {

		super(err.message || err);

		this.name = 'SNSServerlessHandlerError';
		this.code = code;

		if(typeof err !== 'string')
			this.previousError = err;
	}

	/**
	 * Serverless error codes
	 *
	 * @readonly
	 * @static
	 * @memberof SNSServerlessHandlerError
	 */
	static get codes() {
		return {
			INVALID_EVENT: 1,
			INVALID_RECORDS: 2,
			INVALID_MESSAGE: 3,
			PROCESS_NOT_FOUND: 4,
			INTERNAL_ERROR: 5
		};
	}
}

module.exports = SNSServerlessHandlerError;
