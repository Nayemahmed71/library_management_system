const db = require('../config/db'); // Ensure the correct path to your DB config
const Constants = { MAX_BOOKS_ISSUED_TO_A_USER: 5 }; // Example constant

class Account {
    constructor(id, password, person, status = 'Active') {
        this.id = id;
        this.password = password;
        this.person = person;
        this.status = status;
    }

    resetPassword() {
        // Implementation to reset password
    }
}

class Librarian extends Account {
    constructor(id, password, person, status = 'Active') {
        super(id, password, person, status);
    }

    addBookItem(bookItem) {
        const sql = 'INSERT INTO Books (title, author, isbn, available_copies) VALUES (?, ?, ?, ?)';
        db.query(sql, [bookItem.title, bookItem.author, bookItem.isbn, bookItem.available_copies], (err, result) => {
            if (err) {
                console.error('Error adding the book:', err);
                return false;
            }
            console.log('Book added successfully:', result);
            return true;
        });
    }

    blockMember(memberId) {
        const sql = 'UPDATE Members SET status = ? WHERE member_id = ?';
        db.query(sql, ['Blocked', memberId], (err, result) => {
            if (err) {
                console.error('Error blocking the member:', err);
                return false;
            }
            console.log('Member blocked successfully:', result);
            return true;
        });
    }

    unBlockMember(memberId) {
        const sql = 'UPDATE Members SET status = ? WHERE member_id = ?';
        db.query(sql, ['Active', memberId], (err, result) => {
            if (err) {
                console.error('Error unblocking the member:', err);
                return false;
            }
            console.log('Member unblocked successfully:', result);
            return true;
        });
    }
}

class Member extends Account {
    constructor(id, password, person, status = 'Active') {
        super(id, password, person, status);
        this.dateOfMembership = new Date();
        this.totalBooksCheckedOut = 0;
    }

    getTotalBooksCheckedOut() {
        return this.totalBooksCheckedOut;
    }

    incrementTotalBooksCheckedOut() {
        this.totalBooksCheckedOut++;
    }

    checkoutBookItem(bookId) {
        if (this.totalBooksCheckedOut >= Constants.MAX_BOOKS_ISSUED_TO_A_USER) {
            console.log("The user has already checked-out the maximum number of books");
            return false;
        }

        // Add more detailed database interactions to check reservations and checkout logic
        const sql = 'SELECT * FROM BookReservations WHERE book_id = ? AND member_id != ? AND status = "active"';
        db.query(sql, [bookId, this.id], (err, reservations) => {
            if (err) {
                console.error('Error during reservation check:', err);
                return false;
            }

            if (reservations.length > 0) {
                console.log("This book is reserved by another member");
                return false;
            }

            const checkoutSql = 'INSERT INTO BookLendings (book_id, member_id, due_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))';
            db.query(checkoutSql, [bookId, this.id], (err, checkoutResult) => {
                if (err) {
                    console.error('Error during book checkout:', err);
                    return false;
                }
                this.incrementTotalBooksCheckedOut();
                console.log("Book checked out successfully:", checkoutResult);
                return true;
            });
        });
    }
}

module.exports = {
    Account,
    Librarian,
    Member
};
