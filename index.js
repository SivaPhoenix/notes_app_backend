require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const config = require('./config.json');
const { authenticateToken } = require('./utilities/authenticate');
const authController = require('./controllers/auth.controller');
const notesController = require('./controllers/notes.controller');

mongoose.connect(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors());

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.get('/get-user', authenticateToken, authController.getUser);
app.post('/add-note', authenticateToken, notesController.addNote);
app.get('/get-all-notes', authenticateToken, notesController.getAllNotes);
app.put('/edit-note/:noteId', authenticateToken, notesController.editNote);
app.delete('/delete-note/:noteId', authenticateToken, notesController.deleteNote);
// app.get("/search-notes",authenticateToken, notesController.searchNotes)
app.put("/update-isPinned/:id", authenticateToken, notesController.updatePin);

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
