# SQSlisteners

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

## Methods
### async process()
This method is **REQUIRED**, and should have the logic of your Listener.

#### async validate()
This method validates the struct returned in the `struct()` getter. You can extend to perform custom validations. Remember to always call `await super.validate()` first.

### Getters
* **struct** (*getter*)
Returns a validation struct (see [@janiscommerce/superstruct](https://www.npmjs.com/package/@janiscommerce/superstruct))
* **event** (*getter*)
Returns the event of the message.
* **attributes** (*getter*)
Returns the attributes of the message.

## SQSServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `SQSListener` class.
* event {object} The lambda event object
* context {object} The lambda context object
* callback {function} The lambda callback function

## ServerlessHandlerError

Handled errors of the SQS Event or runtime errors inside process. If the error was emitted on the process method you might find more information about the error source in the `previousError` property.

It also uses the following error codes:

| Name | Value | Description |
| --- | --- | --- |
| INVALID_EVENT | 1 | The SQS event is empty or invalid |
| INVALID_RECORDS | 2 | The Records of the event are empty or invalid |
| INVALID_MESSAGE | 3 | The SQS Message of the Records are empty or invalid |
| PROCESS_NOT_FOUND | 4 | The process method is not implemented in the event listener class |
| INTERNAL_ERROR | 5 | Errors generated in the event listener class process method |

## Examples

### SQS Listener

```js
'use strict';

const logger = require('lllog')();

const {
	SQSListener,
	SQSServerlessHandler
} = require('@janiscommerce/aws-listeners');

class MySQSEventListener extends SQSListener {

	get struct() {
		return {
			id: 'objectId',
			message: 'string'
		};
	}

	async process() {
		const { id, message } = this.event;
		logger.info(`Received a message for ID ${id}: ${message}`);
	}

}

module.exports.handler = (...args) => SQSServerlessHandler.handle(MySQSEventListener, ...args);
```
