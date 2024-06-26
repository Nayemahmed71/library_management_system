const mysql = require('mysql');
require('dotenv').config(); // Ensure this line is present if you're using dotenv for environment variables

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Database connected!');
});

module.exports = db;
