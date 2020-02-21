'use strict';

const ServerlessDispatcher = require('./dispatcher');

/**
 * Handle the sqs event
 *
 * @param {ObjectConstructor} Listener The listener class
 * @param {Object} event the sqs event
 */
module.exports.handle = (Listener, event) => ServerlessDispatcher.dispatch(Listener, event);
