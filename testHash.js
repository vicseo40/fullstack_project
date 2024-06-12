const bcrypt = require('bcryptjs');

const password = 'lee'; // Plain password
const dbHash = '$2a$10$rPWDq6YFpJHyvh.mxMOdQu6TjxueMLKrirYg3wgxKtN5udiC52D1i'; // Replace with the actual hash retrieved from the database

bcrypt.compare(password, dbHash, (err, isMatch) => {
    if (err) throw err;
    console.log('Manual password comparison result:', isMatch); // This should be true if the hash is correct
});
