'use strict';

const S3 = require('./s3-wrapper');

class S3Listener {

	constructor(event) {
		this._event = event;
	}

	/**
	 * Get the s3 bucket name
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get bucketName() {
		return this._event.bucketName;
	}

	/**
	 * Get the s3 object (file) key
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get fileKey() {
		return this._event.fileKey;
	}

	/**
	 * Get the s3 object (file) name
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get filename() {
		return this._event.filename;
	}

	/**
	 * Get the s3 object (file) prefix
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get filePrefix() {
		return this._event.filePrefix;
	}

	/**
	 * Get the s3 object (file) extention
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get fileExtention() {
		return this._event.fileExtention;
	}

	/**
	 * Get the s3 object (file) size
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get filesize() {
		return this._event.filesize;
	}

	/**
	 * Get the s3 object (file) md5 tag
	 *
	 * @readonly
	 * @memberof S3Listener
	 */
	get fileTag() {
		return this._event.fileTag;
	}

	/**
	 * Get the S3 file data
	 *
	 * @returns
	 * @memberof S3Listener
	 */
	async getData() {
		const { Body } = await S3.get({ Bucket: this.bucketName, Key: this.fileKey });
		return this.fileExtention === 'json' ? JSON.parse(Body.toString('utf8')) : Body;
	}
}

module.exports = S3Listener;
