'use strict';

const { struct } = require('@janiscommerce/superstruct');

class SQSListener {

	constructor(event, logId) {
		this._event = event;
		this._logId = logId;
	}

	/**
	 * Get the complete sqs event
	 *
	 * @readonly
	 * @memberof SQSListener
	 */
	get event() {
		return this._event;
	}

	/**
	 * Adds a log.
	 *
	 * @param {Mixed} log The log
	 * @memberof SQSListener
	 */
	addLog(log) {
		if(!this._logs)
			this._logs = [];

		this._logs.push({
			name: this.constructor.name,
			type: 2,
			createdAt: Date.now(),
			...log
		});
	}

	/**
	 * Get the listener logs
	 *
	 * @readonly
	 * @memberof SQSListener
	 */
	get logs() {
		return this._logs || [];
	}

	/**
	 * Get the log name
	 *
	 * @memberof SQSListener
	 */
	get logId() {
		return this._logId;
	}

	/**
	 * Get the attributes
	 *
	 * @readonly
	 * @memberof SQSListener
	 */
	get attributes() {

		const attributes = {
			MessageAttributes: {}
		};

		if(this.logId)
			attributes.MessageAttributes.logId = { DataType: 'String',	StringValue: this.logId };

		return attributes;
	}

	/**
	 * Validate the event
	 *
	 * @memberof SQSListener
	 */
	validate() {
		struct(this.struct, this.event);
	}
}

module.exports = SQSListener;
