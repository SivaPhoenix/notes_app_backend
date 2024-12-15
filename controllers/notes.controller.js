const Note = require('../modals/note.modal');

// Add Note
exports.addNote = async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title || !content) {
        return res.status(400).json({ error: true, message: "Title and Content are required" });
    }

    const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: user._id
    });

    await note.save();
    res.json({ error: false, message: "Note added successfully", note });
};

// Get All Notes
exports.getAllNotes = async (req, res) => {
    const { user } = req.user;
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    res.json({ error: false, notes, message: "Notes retrieved successfully" });
};

// Edit Note
exports.editNote = async (req, res) => {
    const { noteId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

    await note.save();
    res.json({ error: false, message: "Note updated successfully", note });
};

// Delete Note
exports.deleteNote = async (req, res) => {
    const { noteId } = req.params;
    const { user } = req.user;

    const note = await Note.findOneAndDelete({ _id: noteId, userId: user._id });
    if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
    }

    res.json({ error: false, message: "Note deleted successfully" });
};
