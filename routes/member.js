const express = require('express');
const router = express.Router();
const { Member } = require('../models/accounts');

// Define routes using Member class
router.get('/register-member', (req, res) => {
    res.render('register-member');
});

router.post('/register-member', (req, res) => {
    const { name, email } = req.body;
    const membershipDate = new Date().toISOString().slice(0, 10);
    const member = new Member(null, null, { name, email }, 'Active', membershipDate);
    if (!member.saveMember(db)) {
        res.status(500).send('Failed to register member.');
    } else {
        res.redirect('/members');
    }
});

module.exports = router;
