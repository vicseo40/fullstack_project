const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const User = require('../models/User');

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Create a new event
router.post('/create', ensureAuthenticated, upload.single('image'), async (req, res) => {
    const { title, date, location, description, category, ageRestriction } = req.body;
    const image = req.file;

    try {
        const newEvent = new Event({
            title,
            date,
            location,
            description,
            category,
            ageRestriction,
            creator: req.user.id,
            attendees: [],
            image: image ? { data: image.buffer, contentType: image.mimetype } : null
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', error });
    }
});

// Get all events for the authenticated user
router.get('/my', ensureAuthenticated, async (req, res) => {
    try {
        const events = await Event.find({ creator: req.user.id });
        res.json(events);
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Error fetching user events', error });
    }
});

// Get events the user is attending
router.get('/bookmarks', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('events');
        res.json(user.events);
    } catch (error) {
        console.error('Error fetching bookmarked events:', error);
        res.status(500).json({ message: 'Error fetching bookmarked events', error });
    }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    try {
        const event = await Event.findById(req.params.id)
            .populate('attendees', 'username email')
            .populate('creator', 'username'); // Populate creator's username
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event', error });
    }
});

// Get all events with pagination, filtering, and sorting
router.get('/', async (req, res) => {
    const { page = 1, limit = 6, category, ageRestriction, month, sort } = req.query;
    const filters = {};
    if (category) filters.category = { $in: category.split(',') };
    if (ageRestriction) filters.ageRestriction = ageRestriction;
    if (month) {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        filters.date = { $gte: startDate, $lt: endDate };
    }
    const sortOptions = {};
    if (sort) {
        const [key, order] = sort.split('-');
        sortOptions[key === 'name' ? 'title' : key] = order === 'asc' ? 1 : -1;
    }

    try {
        const events = await Event.find(filters)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit, 10));

        const count = await Event.countDocuments(filters);
        res.json({
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10)
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error });
    }
});

// Route for getting event image
router.get('/image/:id', async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event || !event.image || !event.image.data) {
            return res.status(404).json({ message: 'Image not found' });
        }
        res.set('Content-Type', event.image.contentType);
        res.send(event.image.data);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ message: 'Error fetching image', error });
    }
});

// Update an event
router.put('/:id', ensureAuthenticated, upload.single('image'), async (req, res) => {
    const { title, date, location, description, category, ageRestriction } = req.body;

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure only the event creator can update the event
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this event' });
        }

        event.title = title || event.title;
        if (req.file) {
            event.image = req.file.buffer.toString('base64');
        }
        event.date = date || event.date;
        event.location = location || event.location;
        event.description = description || event.description;
        event.category = category || event.category;
        event.ageRestriction = ageRestriction || event.ageRestriction;

        await event.save();
        res.json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error updating event', error });
    }
});

// Delete an event
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure only the event creator can delete the event
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this event' });
        }

        await event.remove();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
});

// Attend an event
router.post('/:id/attend', ensureAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({ message: 'User already attending this event' });
        }

        event.attendees.push(req.user.id);
        await event.save();

        const user = await User.findById(req.user.id);
        user.events.push(event.id);
        await user.save();

        res.json({ message: 'Successfully attending event', event });
    } catch (error) {
        res.status(500).json({ message: 'Error attending event', error });
    }
});

// Unattend an event
router.post('/:id/unattend', ensureAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.attendees.includes(req.user.id)) {
            return res.status(400).json({ message: 'User not attending this event' });
        }

        event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.user.id);
        await event.save();

        const user = await User.findById(req.user.id);
        user.events = user.events.filter(e => e.toString() !== event.id);
        await user.save();

        res.json({ message: 'Successfully unattended event', event });
    } catch (error) {
        res.status(500).json({ message: 'Error unattending event', error });
    }
});

module.exports = router;
