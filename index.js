// libraries
const express = require('express');
const mysql = require('mysql2');
const cron = require('node-cron');
const fs = require('fs');

// routes and server
const app = express();

// configure MySQL databases db1 and db2
const db1 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db1'
});

const db2 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db2'
});

// connect to the databases
db1.connect(err => {
    if (err) throw err;
    console.log('Connected to database db1');
});

db2.connect(err => {
    if (err) throw err;
    console.log('Connected to database db2');
});

// create tables if they do not exist
db1.query('CREATE TABLE IF NOT EXISTS tabela1 (id INT PRIMARY KEY, nome VARCHAR(255))', err => {
    if (err) throw err;
    console.log('Table tabela1 created or already exists');
});

db2.query('CREATE TABLE IF NOT EXISTS tabela2 (id INT PRIMARY KEY, nome VARCHAR(255))', err => {
    if (err) throw err;
    console.log('Table tabela2 created or already exists');
});

// function to copy data
const copyData = (sourceTable, targetTable) => {
    // get all columns from sourceTable using DESCRIBE
    db1.query(`DESCRIBE ${sourceTable}`, (err, columns) => {
        if (err) {
            console.error('Error getting table information:', err);
            return;
        }

        // Process columns to create insert and update queries
        const columnsList = columns.map(col => col.Field).join(', '); // column list
        const placeholders = columns.map(() => '?').join(', '); // create placeholders "?" for columns
        const updatePlaceholders = columns.map(col => `${col.Field} = VALUES(${col.Field})`).join(', '); // updates in case of duplication

        // fetch data from sourceTable
        db1.query(`SELECT * FROM ${sourceTable}`, (err, rows) => {
            if (err) {
                console.error('Error fetching data:', err);
                return;
            }

            rows.forEach((row) => {
                //get column values for placeholders
                const values = columns.map(col => row[col.Field]); //column values

                //insert or update data in targetTable
                const retryOperation = (attempt = 1) => {
                    db2.query(
                        `INSERT INTO ${targetTable} (${columnsList}) VALUES (${placeholders})
                        ON DUPLICATE KEY UPDATE ${updatePlaceholders}`, // update if primary key already exists
                        values, // values for placeholders
                        (err) => {
                            if (err) {
                                if (attempt < 3) {
                                    console.log(`Retrying insert/update, attempt ${attempt}`);
                                        retryOperation(attempt + 1); //retry operation up to 3 times
                                } else {
                                    console.error('Error inserting or updating data:', err);
                                    fs.appendFile('error.log', `Error inserting or updating data for ID ${row.id}: ${err}\n`, (fsErr) => {
                                        if (fsErr) console.error('Error writing to log file:', fsErr);
                                    });
                                }
                            } else {
                                console.log(`Data copied: ${row.id}`);
                            }
                        }
                    );
                };
                retryOperation(); //start the retry process
            });
        });
        });
    };



// schedule cron job to run every minute
cron.schedule('* * * * *', () => {
    console.log('Executing cron job...');
    copyData('tabela1', 'tabela2');
});

// basic server
app.get('/', (req, res) => {
    res.send('Cron job is running!');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
