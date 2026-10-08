# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2026-10-08
### Added
- S3 handler logs a warning when the event has more than one record

### Changed
- S3 object key is now URL-decoded
- S3 file extension is the last dot-separated segment of the file name
- `S3Listener.getData()` parses `json` files case-insensitively and returns `null` for empty bodies
- `getObject` propagates stream errors instead of returning a `null` body
- Updated dependencies, Node 22 tooling and reusable GitHub workflows

### Fixed
- S3 and SNS serverless handlers now call `Log.start()` and emit `janiscommerce.ended` when the execution finishes, so the Janis trace layer closes the invocation instead of running until timeout
- Malformed S3 key encoding throws `INVALID_S3_RECORD` instead of a raw `URIError`

## [2.0.0] - 2023-07-24
### Changed
- Update AWS SDK to V3

## [1.0.0] - 2020-08-12
### Added
- `SNSListener` and it's serverless handler
- `SQSListener` and it's serverless handler
- `S3Listener` and it's serverless handler
