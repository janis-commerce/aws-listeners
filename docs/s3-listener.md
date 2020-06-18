# S3listeners

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
    S3_LOCAL_ENDPOINT: http://localhost:30232

custom:
  s3:
    port: 30232
    directory: ./tmp

```

## S3Listener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

### async process()
This method is required, and should have the logic of your Listener.

The following methods will be inherited from the base Listener Class:

### async getData()
This method should return the data inside the S3 file (object) who generates the S3 event.

### Getters

* **bucketName** (*getter*).
Returns the name of the S3 bucket where the event is generated

* **fileKey** (*getter*).
Returns the key of the S3 object (file). This fileKey prop returns the filePrefix + filename + fileExtentions

* **filename** (*getter*).
Returns the name of the file (S3 object).

* **filePrefix** (*getter*).
Returns the prefix of the file (S3 object).

* **fileExtention** (*getter*).
Returns the extention of the file (S3 object).

* **filesize** (*getter*).
Returns the size of the file (S3 object).

* **fileTag** (*getter*).
Returns the eTag of the file (S3 object).

## S3ServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `EventListener` class.
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

## Examples

### Basic Listener

```js
'use strict';

const {
	S3Listener,
	S3ServerlessHandler
} = require('@janiscommerce/s3-listener');

class MyS3EventListener extends S3Listener {

	async process() {
		/* ... Your code to process the s3 event was here ... */
	}

}

module.exports.handler = (...args) => S3ServerlessHandler.handle(MyS3EventListener, ...args);
```

### Get Data

```js
'use strict';

const {
	S3Listener,
	S3ServerlessHandler
} = require('@janiscommerce/s3-listener');

class MyS3EventListener extends S3Listener {

	async process() {
		const data = await this.getData();
		/* ... Your code to process the s3 event was here ... */
	}

}

module.exports.handler = (...args) => S3ServerlessHandler.handle(MyS3EventListener, ...args);
```