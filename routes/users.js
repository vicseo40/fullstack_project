const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
// Fetch all users (admin only)
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Delete a user (admin only)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

// User registration
router.post('/register', async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
      let user = await User.findOne({ email });
      if (user) {
          return res.status(400).json({ error: 'Email already exists' });
      }

      user = new User({
          firstName,
          lastName,
          username,
          email,
          password // Save the plain password, hashing will be handled by the pre-save hook
      });

      await user.save();

      console.log('User saved:', user);
      res.json({ success: true });
  } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Server error' });
  }
});

// User login
router.post('/login', (req, res, next) => {
  console.log('Login request received with body:', req.body);
  passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }
      req.logIn(user, (err) => {
          if (err) return next(err);
          return res.json({ success: true });
      });
  })(req, res, next);
});

// User logout
router.get('/logout', (req, res) => {
    req.logout();
    res.json({ message: 'Logout successful' });
});

// routes/users.js
router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Get current user's profile
router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('username firstName lastName email');
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
});



module.exports = router;
