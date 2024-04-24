const express = require('express');
const { Librarian } = require('../models/accounts');
const router = express.Router();

// Endpoint to add a new book to the library
router.post('/add-book', async (req, res) => {
    const { id, password, person } = req.librarian; // Assuming you have middleware to set this
    const librarian = new Librarian(id, password, person);

    const bookItem = req.body; // Contains title, author, isbn, available_copies

    try {
        const success = await librarian.addBookItem(bookItem);

        if (success) {
            res.status(201).json({ message: 'Book added successfully' });
        } else {
            res.status(500).json({ message: 'Failed to add book' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Other librarian endpoints...

module.exports = router;
