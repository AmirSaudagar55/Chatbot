const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes


// MongoDB Atlas connection URI
const mongoURI = 'connection_String';

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define schema and model for storing answers
const AnswerSchema = new mongoose.Schema({
  question: String,
  answer: String
});
const Answer = mongoose.model('Answer', AnswerSchema);

app.use(bodyParser.json());

// Handle user queries
app.post('/query', async (req, res) => {
  const { question } = req.body;

  try {
    let answer = await Answer.findOne({ question });

    if (!answer) {
      res.json({ response: 'No answer found' });
    } else {
      res.json({ response: answer.answer });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Allow GET requests to the /query endpoint for testing purposes
app.get('/query', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed' });
});


// Handle storing new answers
app.post('/store-answer', async (req, res) => {
  const { question, answer } = req.body;

  try {
    const newAnswer = new Answer({ question, answer });
    await newAnswer.save();
    res.status(201).json({ message: 'Answer stored successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
