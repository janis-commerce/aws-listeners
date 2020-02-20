'use strict';

const ServerlessDispatcher = require('./dispatcher');

/**
 * The Serverless S3 event listener
 *
 * @param {ObjectConstructor} Listener The listener class
 * @param {Object} event The event class
 */
module.exports.handle = (Listener, event) => ServerlessDispatcher.dispatch(Listener, event);
