'use strict';

const logger = require('lllog')('error');

const CloudWatchLogs = require('./wrapper');
const { isObject } = require('../../helpers');

const { CLOUDWATCH_PREFIX } = process.env;

class CloudWatchLogsEvents {

	constructor(logStreamName, randomId) {
		this._logStreamName = logStreamName;
		this._newStream = !logStreamName;
		this._randomId = randomId;
	}

	/**
	 * Get the log types
	 *
	 * @readonly
	 * @memberof CloudWatchLogsEvents
	 */
	get types() {
		return {
			1: 'INIT',
			2: 'REPORT',
			3: 'ERROR',
			4: 'STACK',
			5: 'END'
		};
	}

	/**
	 * Get the log group name
	 *
	 * @readonly
	 * @memberof CloudWatchLogsEvents
	 */
	get logGroupName() {
		return `${CLOUDWATCH_PREFIX}/${this.groupName || 'logs'}`;
	}

	/**
	 * Get the log stream name
	 *
	 * @readonly
	 * @memberof CloudWatchLogsEvents
	 */
	get logStreamName() {
		if(!this._logStreamName) {

			const timestamp = Date.now();
			const stringDate = new Date()
				.toISOString()
				.slice(0, 10);
			const random = Math.random(10)
				.toString()
				.slice(2);

			const randomId = this._randomId || `${timestamp}${random}`;

			this._logStreamName = `${stringDate}-${this.streamName || 'log'}-${randomId}`;
		}

		return this._logStreamName;
	}

	/**
	 * Cloud watch put log
	 *
	 * @param {Array} messages
	 * @memberof CloudWatchLogsEvents
	 */
	async log(messages) {

		const logEvents = this.getLogEvents(messages);
		if(!logEvents.length)
			return;

		const params = {
			logEvents,
			logGroupName: this.logGroupName,
			logStreamName: this.logStreamName
		};

		try {

			const sequenceToken = await this.getSequenceToken();
			if(sequenceToken)
				params.sequenceToken = sequenceToken;

			if(this._newStream)
				await CloudWatchLogs.createLogStream({ logGroupName: this.logGroupName, logStreamName: this.logStreamName	}).promise();

			const { nextSequenceToken } = await CloudWatchLogs
				.putLogEvents(params)
				.promise();

			this._sequenceToken = nextSequenceToken;
			this._newStream = false;

		} catch(err) {
			logger.error(err);
		}
	}

	/**
	 * Structure and make the events to send to cloudwatch
	 *
	 * @param {Array} messages
	 * @returns
	 * @memberof CloudWatchLogsEvents
	 */
	getLogEvents(messages) {

		if(!messages || (isObject(messages) && !Array.isArray(messages) && !Object.keys(messages).length))
			return [];

		const logEvents = !Array.isArray(messages) ? [messages] : messages;

		const timestamp = Date.now();

		return logEvents.map(logEvent => {
			if(Array.isArray(logEvent) || typeof logEvent !== 'object')
				return { message: logEvent.toString(), timestamp };

			const {
				name,
				message,
				type,
				createdAt,
				duration,
				...info
			} = logEvent;

			const logType = `[${this.types[type] || 'REPORT'}]`;
			const logDuration = duration ? ` Duration: ${duration} ms` : '';
			const logMessage = message ? ` MESSAGE "${message}"` : '';

			return {
				message: `${logType} ${name}${logMessage}${logDuration} ${Object.keys(info).length ? `INFO
				${JSON.stringify(info)}` : ''}`,
				timestamp: createdAt || timestamp
			};
		});
	}


	/**
	 * Set the next sequence token to cloudwatch call
	 *
	 * @param {String} sequenceToken
	 * @returns
	 * @memberof CloudWatchLogsEvents
	 */
	async getSequenceToken() {

		if(this._sequenceToken)
			return this._sequenceToken;

		try {
			const { logStreams } = await CloudWatchLogs
				.describeLogStreams({
					logGroupName: this.logGroupName,
					descending: true,
					limit: 1,
					logStreamNamePrefix: this.logStreamName,
					orderBy: 'LogStreamName'
				})
				.promise();

			if(typeof logStreams[0] !== 'object' || logStreams[0].logStreamName !== this.logStreamName)
				return;

			this._newStream = false;
			return logStreams[0].uploadSequenceToken;
		} catch(err) {
			logger.error(err);
			return this._sequenceToken;
		}
	}
}

module.exports = CloudWatchLogsEvents;
