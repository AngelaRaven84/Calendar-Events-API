# Calendar Events API

A serverless REST API for creating and managing calendar events.

The project will be built as a standalone backend that can be connected to my Calendar application in the future.

## Purpose

The purpose of this project is to practise and demonstrate knowledge of:

- AWS Lambda
- API Gateway
- Serverless Framework
- CRUD operations
- Request validation
- Error handling and HTTP status codes
- API testing with Insomnia

## Planned Functions

- [x] Get all events
- [x] Get one event
- [x] Create an event
- [ ] Update an event
- [ ] Delete an event
- [x] Validate event data
- [x] Check for time conflicts

## API Routes

| Method | Route          | Description     |
| ------ | -------------- | --------------- |
| GET    | `/events`      | Get all events  |
| GET    | `/events/{id}` | Get one event   |
| POST   | `/events`      | Create an event |
| PUT    | `/events/{id}` | Update an event |
| DELETE | `/events/{id}` | Delete an event |

## Status

The project is currently under development.
