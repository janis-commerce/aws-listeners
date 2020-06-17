'use strict';

const { struct } = require('@janiscommerce/superstruct');

class SNSListener {

	constructor(event) {
		this._event = event;
	}

	get notificationType() {
		return this._event.notificationType;
	}

	/**
	 * Return the recipients of the email
	 *
	 * @type {Array}
	 */
	get destinationRecipients() {

		const destination = [];

		if(this._event.mail.destination)
			return this._event.mail.destination;

		return destination;
	}

	get rejectedRecipients() {

		const rejectedRecipients = [];

		if(this._event.bounce)
			return this._event.bounce.bouncedRecipients;

		if(this._event.complaint)
			return this._event.complaint.complainedRecipients;

		return rejectedRecipients;
	}

	/**
	 * The type
	 *
	 * @type {string|null}
	 */
	get type() {

		if(this._event.bounce)
			return this._event.bounce.bounceType;

		if(this._event.complaint)
			return this._event.complaint.complaintFeedbackType;

		return null;
	}

	/**
	 * The subType
	 *
	 * @type {string|null}
	 */
	get subType() {

		if(this._event.bounce)
			return this._event.bounce.bounceSubType;

		return null;
	}

	/**
	 * Return the full mail sent
	 *
	 * @type {object}
	 */
	get mail() {
		return this._event.mail;
	}

	/**
	 * Return the messageId of the mail sended
	 *
	 * @type {string}
	 */
	get messageId() {
		return this._event.mail.messageId;
	}

	get sendingAccountId() {
		return this._event.mail.sendingAccountId;
	}

	/**
	 * Validate the event
	 *
	 * @memberof SNSListener
	 */
	validate() {
		struct(this.struct, this.event);
	}
}

module.exports = SNSListener;
