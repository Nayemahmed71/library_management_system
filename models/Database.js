const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log('Connected to the database.');
});

const dbQuery = (sql, params) => new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(results);
    });
});

module.exports = {
    dbQuery
};
