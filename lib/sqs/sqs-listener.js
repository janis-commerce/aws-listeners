'use strict';

const { struct } = require('@janiscommerce/superstruct');

class SQSListener {

	constructor(event) {
		this._event = event;
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
	 * Get the attributes
	 *
	 * @readonly
	 * @memberof SQSListener
	 */
	get attributes() {

		const attributes = {
			MessageAttributes: {}
		};

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
