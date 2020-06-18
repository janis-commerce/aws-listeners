# SQSlisteners

## Configuration

If you are working with serverless framework and want to use the serverless-sqs-local plugin you can config the enviroment variable CLOUDWATCH_PREFIX

``` yml
provider:
  environment:
    CLOUDWATCH_PREFIX: some-prefix

```

## SQSListener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

### async process()
This method is required, and should have the logic of your Listener.

The following methods will be inherited from the base Listener Class:

#### async struct()
This optional method is used to validate the data received in the request, checking the data to be use later.

#### async validate()
This optional method should validate the struct if you use.

#### async addLog()
This method should return add the logs.

### Getters
* **event** (*getter*)
Returns the event of the message.
* **logs** (*getter*)
Returns the logs of the message.
* **logId** (*getter*)
Returns the logId of the message.
* **attributes** (*getter*)
Returns the attributes of the message.

## SQSServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `EventListener` class.
* event {object} The lambda event object
* context {object} The lambda context object
* callback {function} The lambda callback function

## ServerlessHandlerError

Handled errors of the SQS Event or runtime errors inside process. If the error was emit on the process method you might find more information about the error source in the `previousError` property.

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

const {
	SQSListener,
	SQSServerlessHandler
} = require('@janiscommerce/aws-listeners');

class MySQSEventListener extends SQSListener {

	async process() {
		/* ... Your code to process the sqs event was here ... */
	}

}

module.exports.handler = (...args) => SQSServerlessHandler.handle(MySQSEventListener, ...args);
```