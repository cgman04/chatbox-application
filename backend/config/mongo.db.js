const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connected = await mongoose.connect(process.env.MONGO_URI);

        console.log(`Database connected: ${connected.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        process.exit();
    }
};

module.exports = connectDB;