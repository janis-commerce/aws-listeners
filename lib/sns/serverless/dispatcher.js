'use strict';

const SNSServerlessHandlerError = require('./error');

const { isObject } = require('../../helpers');

class SNSServerlessDispatcher {

	/**
	 * Dispatch the event to the SNS listener
	 *
	 * @static
	 * @param {ObjectConstructor} Listener The listener class
	 * @param {Object} event the serverless event
	 * @memberof SNSServerlessDispatcher
	 */
	static async dispatch(Listener, event) {

		this.error = null;

		if(!isObject(event) || !Object.keys(event).length)
			throw new SNSServerlessHandlerError('Event cannot be empty and must be an object', SNSServerlessHandlerError.codes.INVALID_EVENT);

		this.parseEvent(event);

		const listener = new Listener(this._event);

		if(typeof listener.process !== 'function')
			throw new SNSServerlessHandlerError('Process method is required and must be a function', SNSServerlessHandlerError.codes.PROCESS_NOT_FOUND);

		try {

			await listener.process();

		} catch(err) {
			throw new SNSServerlessHandlerError(err, SNSServerlessHandlerError.codes.INTERNAL_ERROR);
		}
	}

	/**
	 * Parse and set the sns event
	 *
	 * @static
	 * @memberof SNSServerlessDispatcher
	 */
	static parseEvent({ Records }) {

		if(!Array.isArray(Records) || !Records.length)
			throw new SNSServerlessHandlerError('Event Records cannot be empty and must be an array', SNSServerlessHandlerError.codes.INVALID_RECORDS);

		try {

			const { Message } = Records[0].Sns;

			this._event = JSON.parse(Message);

		} catch(err) {
			throw new SNSServerlessHandlerError('Invalid message cannot parse the body from Records', SNSServerlessHandlerError.codes.INVALID_MESSAGE);
		}
	}
}

module.exports = SNSServerlessDispatcher;
