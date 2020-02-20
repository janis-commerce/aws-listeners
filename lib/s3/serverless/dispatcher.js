'use strict';

const ServerlessHandlerError = require('./error');

const isObject = value => typeof value === 'object' && !Array.isArray(value);

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

		if(typeof event !== 'object' || !Object.keys(event).length)
			throw new ServerlessHandlerError('Event cannot be empty and must be an object', ServerlessHandlerError.codes.INVALID_EVENT);

		this.s3Event = event;

		const listener = new Listener(this.event);

		if(typeof listener.process !== 'function')
			throw new ServerlessHandlerError('Process method is required and must be a function', ServerlessHandlerError.codes.PROCESS_NOT_FOUND);

		try {
			await listener.process();
		} catch(err) {
			throw new ServerlessHandlerError(err, ServerlessHandlerError.codes.INTERNAL_ERROR);
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
			throw new ServerlessHandlerError('Event Records cannot be empty and must be an array', ServerlessHandlerError.codes.INVALID_RECORDS);

		const { s3: s3Event } = Records[0];
		if(!isObject(s3Event) || !isObject(s3Event.bucket) || !isObject(s3Event.object))
			throw new ServerlessHandlerError('Cannot get the S3 event from Records', ServerlessHandlerError.codes.INVALID_S3_RECORD);

		this._s3Event = s3Event;
	}

	/**
	 * Get the S3 event
	 *
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get event() {

		const { bucketName, fileKey, filesize, fileTag } = this;

		const keyParts = fileKey.split('/');
		const [filename, fileExtention] = keyParts.pop().split('.');
		const filePrefix = keyParts.join('/');

		return {
			bucketName,
			fileKey,
			filename,
			filePrefix,
			fileExtention,
			filesize,
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
		return this.s3Event.object.key;
	}

	/**
	 * Get the s3 event size
	 *
	 * @readonly
	 * @static
	 * @memberof ServerlessDispatcher
	 */
	static get filesize() {
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
