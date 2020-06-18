# aws-listeners

[![Build Status](https://travis-ci.org/janis-commerce/aws-listeners.svg?branch=master)](https://travis-ci.org/janis-commerce/aws-listeners)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/aws-listeners/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/aws-listeners?branch=master)

A Package to implement lambda listeners for some AWS Service events

## Installation
```sh
npm install @janiscommerce/aws-listeners
```

## Usage
```js
const { SQSListener, ServerlessHandler } = require('@janiscommerce/aws-listeners');

class SomeSQSFunction extends SQSListener {

	async process() {
		// process the request
	}
}

module.exports.handler = (...args) => ServerlessHandler.handle(SomeSQSFunction, ...args);
```
## AWS Services you can make a listener

- **`SQS`** Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.
- **`S3`** Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance.
- **`SNS`** Amazon Simple Notification Service (SNS) is a highly available, durable, secure, fully managed pub/sub messaging service that enables you to decouple microservices, distributed systems, and serverless applications.

## Common methods

### async process()
This method is required, and should have the logic of your Listener.

The following methods will be inherited from the base Listener Class:

## S3Listener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

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


## Examples

### S3 Listener

```js
'use strict';

const {
	S3Listener,
	ServerlessHandler
} = require('@janiscommerce/s3-listener');

class MyS3EventListener extends S3Listener {

	async process() {
		const data = await this.getData();
		/* ... Your code to process the s3 event was here ... */
	}

}

module.exports.handler = (...args) => ServerlessHandler.handle(MyS3EventListener, ...args);
```