'use strict';

const SNSServerlessDispatcher = require('./dispatcher');

/**
 * Handle the sns event
 *
 * @param {ObjectConstructor} Listener The listener class
 * @param {Object} event the sns event
 */
module.exports.handle = (Listener, event) => SNSServerlessDispatcher.dispatch(Listener, event);
