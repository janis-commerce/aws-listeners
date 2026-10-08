'use strict';

const Log = require('@janiscommerce/log');
const Events = require('@janiscommerce/events');

const SNSServerlessDispatcher = require('./dispatcher');

/**
 * Handle the sns event
 *
 * @param {ObjectConstructor} Listener The listener class
 * @param {Object} event the sns event
 * @param {Object} [context] The lambda context
 */
module.exports.handle = async (Listener, event, context) => {

	process.env.AWS_LAMBDA_REQUEST_ID = context?.awsRequestId || '';

	Log.start();

	try {
		return await SNSServerlessDispatcher.dispatch(Listener, event);
	} finally {
		await Events.emit('janiscommerce.ended');
	}
};
