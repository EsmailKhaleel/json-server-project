const mongoose = require('mongoose');
const mongodbURI = "mongodb+srv://esmailkhaleel27:rf6pm9EE6IqIygHV@first-cluster.u3asc0s.mongodb.net/?retryWrites=true&w=majority&appName=first-cluster";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongodbURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 