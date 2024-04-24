const express = require('express');
const router = express.Router();
const { Librarian, Member } = require('../models/accounts');  // Import the classes

// Database connection assumed to be established and exported from another file
const db = require('../db');

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
    const librarian = new Librarian(id, password, person);
    librarian.addBookItem({ title, author, isbn, available_copies });

    const sql = 'INSERT INTO Books (title, author, isbn, available_copies) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, author, isbn, available_copies], (err, result) => {
        if (err) {
            console.error('Error adding the book: ', err);
            res.status(500).send('Error adding the book to the database');
        } else {
            res.status(201).send('Book added successfully');
        }
    });
});

// Update a book by a Librarian
router.put('/:id', (req, res) => {
    const { id, password, person, title, author, isbn, available_copies } = req.body;
    const librarian = new Librarian(id, password, person);
    librarian.addBookItem({ title, author, isbn, available_copies });

    const bookId = req.params.id;
    const sql = 'UPDATE Books SET title = ?, author = ?, isbn = ?, available_copies = ? WHERE book_id = ?';
    db.query(sql, [title, author, isbn, available_copies, bookId], (err, result) => {
        if (err) {
            console.error('Error updating the book: ', err);
            res.status(500).send('Error updating the book in the database');
        } else {
            res.send('Book updated successfully');
        }
    });
});

// Member checks out a book
router.post('/checkout/:id', (req, res) => {
    const { memberId, password, person, bookId } = req.body;
    const member = new Member(memberId, password, person);
    const bookItem = { id: bookId }; // Simplified representation of a book item
    if (member.checkoutBookItem(bookItem)) {
        res.send('Book checked out successfully');
    } else {
        res.status(400).send('Failed to check out the book');
    }
});

// Export the router
module.exports = router;
