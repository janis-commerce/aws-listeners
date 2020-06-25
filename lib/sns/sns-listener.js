'use strict';

class SNSListener {

	constructor(event) {
		this._event = event;
	}

	get event() {
		return this._event;
	}
}

module.exports = SNSListener;
