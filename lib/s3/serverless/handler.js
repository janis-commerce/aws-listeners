'use strict';

const Log = require('@janiscommerce/log');
const Events = require('@janiscommerce/events');

const ServerlessDispatcher = require('./dispatcher');

/**
 * The Serverless S3 event listener
 *
 * @param {ObjectConstructor} Listener The listener class
 * @param {Object} event The event class
 * @param {Object} [context] The lambda context
 */
module.exports.handle = async (Listener, event, context) => {

	process.env.AWS_LAMBDA_REQUEST_ID = context?.awsRequestId || '';

	Log.start();

	try {
		return await ServerlessDispatcher.dispatch(Listener, event);
	} finally {
		await Events.emit('janiscommerce.ended');
	}
};
