# IntelliTrip Database Documentation & Schemas

This directory holds database scripts, MongoDB schemas, seed data definitions, and migrations for the IntelliTrip platform.

## Structure
- `/schema`: Mongoose schema documentation and entity relationship definitions.
- `/seed`: Sample seed scripts for initial deployment and development environments (users, destinations, hotels, experiences).

## Connection
Database: MongoDB Atlas (or local MongoDB for development)
ODM: Mongoose
URI Format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/intellitrip`
