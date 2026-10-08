'use strict';

const logger = require('lllog')();

const S3ServerlessHandlerError = require('./error');

const { isObject } = require('../../helpers');

class ServerlessDispatcher {

	/**
	 * Dispatch the event to the listener package
	 *
	 * @static
	 * @param {*} Listener
	 * @param {*} event
	 * @memberof ServerlessDispatcher
	 */
	static async dispatch(Listener, event) {

		if(!isObject(event) || !Object.keys(event).length)
			throw new S3ServerlessHandlerError('Event cannot be empty and must be an object', S3ServerlessHandlerError.codes.INVALID_EVENT);

		this.s3Event = event;

		if(event.Records.length > 1)
			logger.warn(`S3 event received with ${event.Records.length} records, only the first one will be processed`);

		const listener = new Listener(this.event);

		if(typeof listener.process !== 'function')
			throw new S3ServerlessHandlerError('Process method is required and must be a function', S3ServerlessHandlerError.codes.PROCESS_NOT_FOUND);

		try {
			await listener.process();
		} catch(err) {
			throw new S3ServerlessHandlerError(err, S3ServerlessHandlerError.codes.INTERNAL_ERROR);
		}
	}

	/**
	 * Get the S3 event
	 *
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get s3Event() {
		return this._s3Event;
	}

	/**
	 * Set the S3 event
	 *
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static set s3Event({ Records }) {

		if(!Array.isArray(Records) || !Records.length)
			throw new S3ServerlessHandlerError('Event Records cannot be empty and must be an array', S3ServerlessHandlerError.codes.INVALID_RECORDS);

		const { s3: s3Event } = Records[0];
		if(!isObject(s3Event) || !isObject(s3Event.bucket) || !isObject(s3Event.object))
			throw new S3ServerlessHandlerError('Cannot get the S3 event from Records', S3ServerlessHandlerError.codes.INVALID_S3_RECORD);

		this._s3Event = s3Event;
	}

	/**
	 * Get the S3 event
	 *
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get event() {

		const { bucketName, fileKey, fileSize, fileTag } = this;

		const keyParts = fileKey.split('/');
		const fullName = keyParts.pop();
		const filePrefix = keyParts.join('/');

		// A leading dot (.hidden) is part of the name, not an extension separator
		const extensionIndex = fullName.lastIndexOf('.');
		const hasExtension = extensionIndex > 0;

		const fileName = hasExtension ? fullName.slice(0, extensionIndex) : fullName;
		const fileExtension = hasExtension ? fullName.slice(extensionIndex + 1) : undefined;

		return {
			bucketName,
			fileKey,
			fileName,
			filePrefix,
			fileExtension,
			fileSize,
			fileTag
		};
	}

	/**
	 * Get the event bucket name
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get bucketName() {
		return this.s3Event.bucket.name;
	}

	/**
	 * Get the s3 event key
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get fileKey() {
		// S3 events encode the key as application/x-www-form-urlencoded (spaces as +)
		try {
			return decodeURIComponent(this.s3Event.object.key.replace(/\+/g, ' '));
		} catch(err) {
			throw new S3ServerlessHandlerError(`Cannot decode the S3 object key: ${err.message}`, S3ServerlessHandlerError.codes.INVALID_S3_RECORD);
		}
	}

	/**
	 * Get the s3 event size
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get fileSize() {
		return this.s3Event.object.size;
	}

	/**
	 * Get the s3 event eTag
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get fileTag() {
		return this.s3Event.object.eTag;
	}
}

module.exports = ServerlessDispatcher;
