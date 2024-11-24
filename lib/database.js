const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect('MONGODB_STRING', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

module.exports = connectToDatabase;
