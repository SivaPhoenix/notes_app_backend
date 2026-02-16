require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const config = require('./config.json');
const { authenticateToken } = require('./utilities/authenticate');
const authController = require('./controllers/auth.controller');
const notesController = require('./controllers/notes.controller');

const app = express();
const port = process.env.PORT || 8080;

mongoose.connect(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
    console.error('MongoDB connection failed:', error.message);
});

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
    const isDatabaseConnected = mongoose.connection.readyState === 1;

    res.status(isDatabaseConnected ? 200 : 503).json({
        status: isDatabaseConnected ? 'ok' : 'degraded',
        database: isDatabaseConnected ? 'connected' : 'disconnected',
    });
});

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/get-user', authenticateToken, authController.getUser);
app.post('/add-note', authenticateToken, notesController.addNote);
app.get('/get-all-notes', authenticateToken, notesController.getAllNotes);
app.put('/edit-note/:noteId', authenticateToken, notesController.editNote);
app.delete('/delete-note/:noteId', authenticateToken, notesController.deleteNote);
app.put('/update-isPinned/:id', authenticateToken, notesController.updatePin);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
