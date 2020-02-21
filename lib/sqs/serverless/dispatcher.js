'use strict';

const SQSServerlessHandlerError = require('./error');

const EventLogger = require('../../modules/log/event');

class ServerlessDispatcher {

	/**
	 * Dispatch the event to the SQS listener
	 *
	 * @static
	 * @param {ObjectConstructor} Listener The listener class
	 * @param {Object} slsEvent the serverless event
	 * @memberof ServerlessDispatcher
	 */
	static async dispatch(Listener, slsEvent) {

		this.error = null;

		const startTime = new Date().getTime();

		if(typeof slsEvent !== 'object' || !Object.keys(slsEvent).length)
			throw new SQSServerlessHandlerError('Event cannot be empty and must be an object', SQSServerlessHandlerError.codes.INVALID_EVENT);

		this.parseEvent(slsEvent);

		this._logger = new EventLogger(this._event, this._logId, this._messageId);

		const listener = new Listener(this._event, this._logger.logStreamName);

		await this._logger.log({
			name: listener.constructor.name,
			type: 1,
			message: 'Event received',
			slsEvent,
			event: this._event
		});

		await this.process(listener);

		await this.logging(listener, startTime);

		if(this.error && !listener.notThrow)
			throw this.error;
	}

	/**
	 * Parse and set the sqs event
	 *
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static parseEvent({ Records }) {

		if(!Array.isArray(Records) || !Records.length)
			throw new SQSServerlessHandlerError('Event Records cannot be empty and must be an array', SQSServerlessHandlerError.codes.INVALID_RECORDS);

		try {

			const { messageId, body, messageAttributes: { logId } } = Records[0];

			this._event = { client: null, id: null, ...JSON.parse(body) };
			this._messageId = messageId;

			if(logId)
				this._logId = logId.stringValue;

		} catch(err) {
			throw new SQSServerlessHandlerError('Invalid message cannot parse the body from Records', SQSServerlessHandlerError.codes.INVALID_MESSAGE);
		}
	}

	/**
	 * Process the event and send to listener
	 *
	 * @static
	 * @param {ObjectConstructor} Listener
	 * @memberof ServerlessDispatcher
	 */
	static async process(listener) {

		try {
			if(typeof listener.process !== 'function')
				throw new SQSServerlessHandlerError('Process method is required and must be a function', SQSServerlessHandlerError.codes.PROCESS_NOT_FOUND);

			if(listener.struct)
				listener.validate();

			await listener.process();
		} catch(err) {
			this.error = new SQSServerlessHandlerError(err, SQSServerlessHandlerError.codes.INTERNAL_ERROR);
		}
	}

	/**
	 * Logging incomming event, listener logs and errors
	 *
	 * @static
	 * @param {Object} listener
	 * @param {Object} slsEvent
	 * @memberof ServerlessDispatcher
	 */
	static async logging(listener, startTime) {

		const logs = [
			...listener.logs
		];

		if(this.error) {
			logs.push({
				name: listener.constructor.name,
				type: 3,
				message: 'Event process fails'
			});

			this.addErrorLog(logs, this.error);
		}

		logs.push({
			name: listener.constructor.name,
			type: 5,
			message: 'Process finished',
			duration: new Date().getTime() - startTime
		});

		await this._logger.log(logs);
	}

	/**
	 * Add an error logs
	 *
	 * @static
	 * @param {*} logs
	 * @param {*} error
	 * @memberof ServerlessDispatcher
	 */
	static addErrorLog(logs, error) {

		logs.push({
			name: error.name,
			type: 4,
			message: error.stack
		});

		if(error.previousError)
			this.addErrorLog(logs, error.previousError);
	}
}

module.exports = ServerlessDispatcher;
