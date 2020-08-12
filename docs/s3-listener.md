# S3listeners

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

## Methods
### async process()
This method is **REQUIRED**, and should have the logic of your Listener.

The following methods will be inherited from the base Listener Class:

### async getData()
This method returns the data of the S3 object that generated the S3 event. If the file extension is `.json`, it will be parsed with `JSON.parse()` before returning.

### Getters

* **bucketName** (*getter*).
Returns the name of the S3 bucket where the event is generated

* **fileKey** (*getter*).
Returns the key of the S3 object (file). This fileKey prop returns the filePrefix + fileName + fileExtensions

* **fileName** (*getter*).
Returns the name of the file (S3 object).

* **filePrefix** (*getter*).
Returns the prefix of the file (S3 object).

* **fileExtension** (*getter*).
Returns the extention of the file (S3 object).

* **fileSize** (*getter*).
Returns the size of the file (S3 object).

* **fileTag** (*getter*).
Returns the eTag of the file (S3 object).

# S3ServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `S3Listener` class.
* event {object} The lambda event object
* context {object} The lambda context object
* callback {function} The lambda callback function

## ServerlessHandlerError

Handled errors of the S3 Event or runtime errors inside process. If the error was emit on the process method you might find more information about the error source in the `previousError` property.

It also uses the following error codes:

| Name | Value | Description |
| --- | --- | --- |
| INVALID_EVENT | 1 | The s3 event is empty or invalid |
| INVALID_RECORDS | 2 | The Records of the event are empty or invalid |
| INVALID_S3_RECORD | 3 | The S3 Records of the event are empty or invalid |
| PROCESS_NOT_FOUND | 4 | The process method is not implemented in the event listener class |
| INTERNAL_ERROR | 5 | Errors generated in the event listener class process method |

## Configuration

If you are working with serverless framework and want to use the serverless-s3-local plugin you need to config the enviroment variable S3_LOCAL_ENDPOINT

``` yml
provider:
  environment:
    S3_LOCAL_ENDPOINT: http://localhost:{serverless-s3-local-port}

```

``` yml
provider:
  environment:
    S3_LOCAL_ENDPOINT: http://localhost:{port}

custom:
  s3:
    port: {port}
    directory: ./tmp

```

## Examples

### Basic Listener

```js
'use strict';

const logger = require('lllog')();

const {
	S3Listener,
	S3ServerlessHandler
} = require('@janiscommerce/aws-listeners');

class MyS3EventListener extends S3Listener {

	async process() {
		const data = await this.getData();

		logger.info(`Processing file '${this.fileKey}' from bucket '${this.bucketName}'`);
		logger.info(`Content: ${data}`);
	}

}

module.exports.handler = (...args) => S3ServerlessHandler.handle(MyS3EventListener, ...args);
```
