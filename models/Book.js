const express = require('express');
const router = express.Router();
const { Librarian, Member } = require('../models/accounts'); // Import the classes
const db = require('../db'); // Import database connection

// Get all books
router.get('/', (req, res) => {
    db.query('SELECT * FROM Books', (err, results) => {
        if (err) {
            console.error('Error fetching books: ', err);
            res.status(500).send('Error fetching books from the database');
        } else {
            res.json(results);
        }
    });
});

// Get a single book by ID
router.get('/:id', (req, res) => {
    const bookId = req.params.id;
    db.query('SELECT * FROM Books WHERE book_id = ?', [bookId], (err, results) => {
        if (err) {
            console.error('Error fetching the book: ', err);
            res.status(500).send('Error fetching the book from the database');
        } else {
            res.json(results[0] || {});
        }
    });
});

// Add a new book by a Librarian
router.post('/', (req, res) => {
    const { id, password, person, title, author, isbn, available_copies } = req.body;
    // Authenticate librarian
    const librarian = new Librarian(id, password, person);
    // Implement addBookItem in the Librarian class to interact with the database
    librarian.addBookItem({ title, author, isbn, available_copies }, (error) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            res.status(201).send('Book added successfully');
        }
    });
});

// Update a book by a Librarian
router.put('/:id', (req, res) => {
    // ... Similar to add a new book, but update instead
});

// Member checks out a book
router.post('/checkout/:id', (req, res) => {
    const { memberId, password, person } = req.body;
    const bookId = req.params.id;
    // Authenticate member
    const member = new Member(memberId, password, person);
    // Implement checkoutBookItem in the Member class to interact with the database
    member.checkoutBookItem(bookId, (error) => {
        if (error) {
            res.status(500).send(error.message);
        } else {
            res.status(200).send('Book checked out successfully');
        }
    });
});

// Return a book by a Member
router.post('/return/:id', (req, res) => {
    // ... Similar to check out, but return instead
});

module.exports = router;
