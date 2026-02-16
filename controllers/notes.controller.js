const mongoose = require('mongoose');
const Note = require('../modals/note.modal');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

// Add Note
exports.addNote = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: true, message: 'DB not connected. Please try again.' });
        }

        const { title, content, tags } = req.body;
        const { user } = req.user;

        if (!title || !content) {
            return res.status(400).json({ error: true, message: 'Title and Content are required' });
        }

        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id,
        });

        await note.save();
        res.json({ error: false, message: 'Note added successfully', note });
    } catch (error) {
        console.error('Add note failed:', error.message);
        res.status(500).json({ error: true, message: 'Unable to add note right now.' });
    }
};

// Get All Notes
exports.getAllNotes = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: true, message: 'DB not connected. Please try again.' });
        }

        const { user } = req.user;
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
        res.json({ error: false, notes, message: 'Notes retrieved successfully' });
    } catch (error) {
        console.error('Get all notes failed:', error.message);
        res.status(500).json({ error: true, message: 'Unable to fetch notes right now.' });
    }
};

// Edit Note
exports.editNote = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: true, message: 'DB not connected. Please try again.' });
        }

        const { noteId } = req.params;
        const { title, content, tags, isPinned } = req.body;
        const { user } = req.user;

        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: 'Note not found' });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

        await note.save();
        res.json({ error: false, message: 'Note updated successfully', note });
    } catch (error) {
        console.error('Edit note failed:', error.message);
        res.status(500).json({ error: true, message: 'Unable to update note right now.' });
    }
};

// Delete Note
exports.deleteNote = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: true, message: 'DB not connected. Please try again.' });
        }

        const { noteId } = req.params;
        const { user } = req.user;

        const note = await Note.findOneAndDelete({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({ error: true, message: 'Note not found' });
        }

        res.json({ error: false, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note failed:', error.message);
        res.status(500).json({ error: true, message: 'Unable to delete note right now.' });
    }
};

exports.updatePin = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return res.status(503).json({ error: true, message: 'DB not connected. Please try again.' });
        }

        const { id } = req.params;
        const { isPinned } = req.body;

        const updatedNote = await Note.findByIdAndUpdate(id, { isPinned }, { new: true });

        if (!updatedNote) {
            return res.status(404).json({ error: true, message: 'Note not found' });
        }

        res.status(200).json({ error: false, message: 'Pinned status updated successfully', note: updatedNote });
    } catch (error) {
        console.error('Update pinned status failed:', error.message);
        res.status(500).json({ error: true, message: 'An error occurred while updating the pinned status' });
    }
};
