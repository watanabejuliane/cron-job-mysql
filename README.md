Backend with Cron Job for Data Transfer

This project involves creating a backend with a cron job to fetch and copy data between tables in different databases using JavaScript with Express and MySQL.

The cron job is scheduled to run at regular intervals to ensure that the data is synchronized between the specified tables.

Features
Scheduled Data Transfer: Uses node-cron to schedule a job that runs every minute to copy data from one table to another.
Database Setup: Configures two MySQL databases and ensures that the required tables exist.
Data Synchronization: Fetches data from a source table and inserts or updates it in a destination table, handling any duplicate key conflicts.
