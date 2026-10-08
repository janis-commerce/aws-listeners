# SNSListener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

## Methods
### async process()
This method is **REQUIRED**, and should have the logic of your Listener.

### Getters
* **message** (*getter*).
Returns the message received in the event parsed using `JSON.parse()`.

## SNSServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context)
This will handle the lambda execution. It calls `Log.start()` from `@janiscommerce/log` and always emits the `janiscommerce.ended` event when the execution finishes (with or without errors), so the Janis trace layer closes the invocation.
* Listener {Class} The event listener class. It's recommended to extend from this package `SNSListener` class.
* event {object} The lambda event object
* context {object} The lambda context object. Its `awsRequestId` is set in `process.env.AWS_LAMBDA_REQUEST_ID`

## ServerlessHandlerError

Handled errors of the SNS Event or runtime errors inside process. If the error was emit on the process method you might find more information about the error source in the `previousError` property.

It also uses the following error codes:

| Name | Value | Description |
| --- | --- | --- |
| INVALID_EVENT | 1 | The SNS event is empty or invalid |
| INVALID_RECORDS | 2 | The Records of the event are empty or invalid |
| INVALID_MESSAGE | 3 | The SNS Message of the Records are empty or invalid |
| PROCESS_NOT_FOUND | 4 | The process method is not implemented in the event listener class |
| INTERNAL_ERROR | 5 | Errors generated in the event listener class process method |

## Examples

### Basic Listener

```js
'use strict';

const logger = require('lllog')();

const {
	SNSListener,
	SNSServerlessHandler
} = require('@janiscommerce/aws-listeners');

class MySNSEventListener extends SNSListener {

	async process() {
		logger.info(`Received a new message: ${JSON.stringify(this.message)}`);
	}

}

module.exports.handler = (...args) => SNSServerlessHandler.handle(MySNSEventListener, ...args);
```
