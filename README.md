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

## Common method
There is a common method that in all the listeners are required and must have to implement

### async process()
This method is required, and should have the logic of your Listener.

## Expendend documentation
for a more detailed explanation you can go to the following documents

- **[S3](docs/s3-listener.md)**
- **[SNS](docs/sns-listener.md)**
- **[SQS](docs/sqs-listener.md)**

## Examples

### S3 Listener

```js
'use strict';

const { S3Listener, S3ServerlessHandler } = require('@janiscommerce/aws-listeners');

class MyS3EventListener extends S3Listener {

	async process() {
		const data = await this.getData();
		/* ... Your code to process the s3 event was here ... */
	}

}

module.exports.handler = (...args) => S3ServerlessHandler.handle(MyS3EventListener, ...args);
```