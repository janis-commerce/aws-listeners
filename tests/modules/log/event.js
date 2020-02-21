'use strict';

const assert = require('assert');

const EventLogger = require('../../../lib/modules/log/event');

describe('Event Logger Test', () => {

	it('Should return the group name', () => {
		assert.deepStrictEqual(EventLogger.prototype.groupName, 'emitted');
	});

	it('Should return the stream name', () => {
		const eventLogger = new EventLogger({ service: 'test', entity: 'testing', event: 'created' });
		assert.deepStrictEqual(eventLogger.streamName, 'test-testing-created');
	});
});
