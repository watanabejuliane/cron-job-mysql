# Backend with Cron Job for Data Transfer
This project involves creating a backend with a cron job to fetch and copy data between tables in different databases using JavaScript with Express and MySQL.

## Features
Scheduled Data Transfer: Uses node-cron to schedule a job that runs every minute to copy data from one table to another.

Database Setup: Configures two MySQL databases and ensures that the required tables exist. Creates tables if they do not already exist, including a column with NOT NULL constraint to facilitate error testing.

Data Synchronization: Fetches data from a source table and inserts or updates it in a destination table, handling any duplicate key conflicts.

Error Handling with Retry Mechanism: Implements a retry mechanism (retryOperation) that attempts to insert or update data up to three times in case of an error, such as violating NOT NULL constraints. If the operation fails after three attempts, the error is logged to a file for review.

Logging: Errors encountered during data transfer are logged, ensuring that issues can be reviewed and addressed.
