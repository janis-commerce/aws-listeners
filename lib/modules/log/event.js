'use strict';

const CloudWatchLogsEvents = require('../../modules/cloudwatch-logs/events');

class EventLogger extends CloudWatchLogsEvents {

	constructor(event, logStreamName, randomId) {
		super(logStreamName, randomId);
		this.event = event;
	}

	/**
	 * Get the log group name
	 * @see parent logGroupName
	 *
	 * @readonly
	 * @memberof EventLogger
	 */
	get groupName() {
		return 'emitted';
	}

	/**
	 * Get the stream name
	 *
	 * @readonly
	 * @memberof EventLogger
	 */
	get streamName() {
		const { service, entity, event } = this.event;
		return `${service}-${entity}-${event}`;
	}
}

module.exports = EventLogger;
