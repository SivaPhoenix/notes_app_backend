const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdOn: { type: Date, default: Date.now }
});

// Check if the model is already registered, and if not, create it
module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);
