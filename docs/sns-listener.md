# S3listeners

## SNSListener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

### async process()
This method is required, and should have the logic of your Listener.

### Getters
* **notificationType** (*getter*).
Returns the notificationType of the message.

* **destinationRecipients** (*getter*).
Returns the destinationRecipients of the message.

* **rejectedRecipients** (*getter*).
Returns the rejectedRecipients of the message.

* **type** (*getter*).
Returns the type of the message.

* **subType** (*getter*).
Returns the subType of the message.

* **mail** (*getter*).
Returns the mail of the message.

* **messageId** (*getter*).
Returns the messageId of the message.

* **sendingAccountId** (*getter*).
Returns the sendingAccountId of the message.

## SNSServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `EventListener` class.
* event {object} The lambda event object
* context {object} The lambda context object
* callback {function} The lambda callback function

## ServerlessHandlerError

Handled errors of the SNS Event or runtime errors inside process. If the error was emit on the process method you might find more information about the error source in the `previousError` property.

It also uses the following error codes:

| Name | Value | Description |
| --- | --- | --- |
| INVALID_EVENT | 1 | The sns event is empty or invalid |
| INVALID_RECORDS | 2 | The Records of the event are empty or invalid |
| INVALID_MESSAGE | 3 | The SNS Message of the Records are empty or invalid |
| PROCESS_NOT_FOUND | 4 | The process method is not implemented in the event listener class |
| INTERNAL_ERROR | 5 | Errors generated in the event listener class process method |

## Examples

### Basic Listener

```js
'use strict';

const {
	SNSListener,
	SNSServerlessHandler
} = require('@janiscommerce/aws-listeners');

class MySNSEventListener extends SNSListener {

	async process() {
		/* ... Your code to process the s3 event was here ... */
	}

}

module.exports.handler = (...args) => SNSServerlessHandler.handle(MySNSEventListener, ...args);
```
