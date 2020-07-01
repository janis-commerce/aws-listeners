'use strict';

class SNSListener {

	constructor(message) {
		this._message = message;
	}

	get message() {
		return this._message;
	}
}

module.exports = SNSListener;
