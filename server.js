require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { ensureAuthenticated, ensureGuest } = require('./middleware/authMiddleware');

// Initialize Express
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sessions
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: null },  // This will set the session cookie to expire when the browser is closed
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    })
});

app.use(sessionMiddleware);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Config
require('./config/passport')(passport);

// MongoDB connection
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log("MongoDB connected...");

    // Load Models
    require('./models/User');
    require('./models/Event');

    // Routes
    app.use('/api/events', require('./routes/events'));
    app.use('/api/users', require('./routes/users'));

    // Authentication status route
    app.get('/api/auth/status', (req, res) => {
        if (req.isAuthenticated()) {
            res.json({ isAuthenticated: true, isAdmin: req.user.isAdmin });
        } else {
            res.json({ isAuthenticated: false });
        }
    });

    // Root URL redirect
    app.get('/', (req, res) => {
        res.redirect('/all_events.html');
    });

    // Protect routes
    app.get('/my_events.html', ensureAuthenticated, (req, res) => {
        res.sendFile(__dirname + '/public/my_events.html');
    });
    app.get('/bookmarks.html', ensureAuthenticated, (req, res) => {
        res.sendFile(__dirname + '/public/bookmarks.html');
    });
    app.get('/profile.html', ensureAuthenticated, (req, res) => {
        res.sendFile(__dirname + '/public/profile.html');
    });
    app.get('/admin.html', ensureAuthenticated, (req, res) => {
        if (!req.user.isAdmin) {
            return res.redirect('/all_events.html');
        }
        res.sendFile(__dirname + '/public/admin.html');
    });

    // Allow public access to these pages
    app.get('/all_events.html', (req, res) => {
        res.sendFile(__dirname + '/public/all_events.html');
    });
    app.get('/login.html', ensureGuest, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    });
    app.get('/signup.html', ensureGuest, (req, res) => {
        res.sendFile(__dirname + '/public/signup.html');
    });
    app.get('/password_change.html', ensureAuthenticated, (req, res) => {
        res.sendFile(__dirname + '/public/password_change.html');
    });

    // Serve static files
    app.use(express.static('public'));

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log("Shutting down server...");
        await mongoose.connection.close();
        server.close(() => {
            console.log("Server shut down gracefully.");
            process.exit(0);
        });
    });

}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
