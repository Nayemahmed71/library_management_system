const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet()); // Security enhancements
app.use(morgan('combined')); // HTTP request logging

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration and connection setup
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

let db;

function handleDisconnect() {
    db = mysql.createConnection(dbConfig);
    db.connect(err => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connected to the database.');
        }
    });

    db.on('error', err => {
        console.error('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// Routers
const booksRouter = require('./routes/books');
const accountsRouter = require('./routes/accounts');
const librarianRouter = require('./routes/librarian');
const memberRouter = require('./routes/member');

app.use('/books', booksRouter);
app.use('/accounts', accountsRouter);
app.use('/librarian', librarianRouter);
app.use('/member', memberRouter);

// Home Page Route
app.get('/', (req, res) => {
    res.render('index', { featuredBooks: [], searchResults: [] });
});

// Featured Books Route
app.get('/featured', (req, res) => {
    const featuredBooksQuery = "SELECT * FROM Books WHERE is_featured = 1";
    db.query(featuredBooksQuery, (err, featuredBooks) => {
        if (err) {
            console.error('Error fetching featured books:', err);
            return res.status(500).render('error', { message: 'Server error fetching featured books' });
        }
        res.render('featured', { featuredBooks: featuredBooks || [] });
    });
});

// Search Route
app.get('/search', (req, res) => {
    const searchQuery = req.query.query;
    const searchSQL = "SELECT * FROM Books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?";
    db.query(searchSQL, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            console.error('Error during search:', err);
            return res.status(500).render('error', { message: 'Server error during search' });
        }
        res.render('search', { searchResults: results, query: searchQuery });
    });
});


// Manage Books Route
app.get('/manage-books', (req, res) => {
    res.render('manage-books');
});

// Register Member Route
app.get('/register-member', (req, res) => {
    res.render('register-member');
});

// POST route for registering a member
app.post('/register-member', (req, res) => {
    const { name, email, membership_date } = req.body;
    const membershipDate = new Date().toISOString().slice(0, 10); // Automatically sets today's date

    const sql = 'INSERT INTO Members (name, email, membership_date) VALUES (?, ?, ?)';
    db.query(sql, [name, email, membership_date], (err, result) => {
        if (err) {
            console.error('Error registering new member:', err);
            // Redirect to an error page or send back an error message
            res.render('register-member', { 
                error: 'Failed to register the member. Please ensure the email is not already used.'
            });
        } else {
            // Redirect to a success page or display a success message
            res.render('register-member', {
                message: 'Member registered successfully!'
            });
        }
    });
});

// Loan Books Route
app.get('/loan-books', (req, res) => {
    res.render('loan-books');
});

// POST route for issuing a loan
app.post('/loan-books', (req, res) => {
    const { bookId, memberId, loan_date, return_date } = req.body;

    // SQL query to insert the loan record into the database
    const sql = 'INSERT INTO Loans (book_id, member_id, loan_date, return_date) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [bookId, memberId, loan_date, return_date], (err, result) => {
        if (err) {
            console.error('Error issuing loan:', err);
            // Render the loan form again with an error message
            res.render('loan-books', {
                error: 'Failed to issue the loan. Please check the data and try again.'
            });
        } else {
            // Redirect to the loan-books page with a success message
            res.redirect(`/loan-books?message=Loan issued successfully!`);
        }
    });
});



// POST route for managing book inventories
app.post('/submit-manage-books', (req, res) => {
    const { title, author, isbn, available_copies } = req.body;
    const sql = 'INSERT INTO Books (title, author, isbn, available_copies) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, author, isbn, available_copies], (err, result) => {
        if (err) {
            console.error('Error adding book to the database:', err);
            return res.status(500).render('error', { message: 'Failed to add the book to the database.' });
        }
        res.redirect('/manage-books');
    });
});

// Error Handling Routes
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
