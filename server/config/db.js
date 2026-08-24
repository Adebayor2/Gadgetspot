const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const URI = process.env.MONGO_URI

const dbConnect = () => {
    return mongoose.connect(URI)
        .then(() => {
            console.log('Connected to MongoDB')
        })
        .catch((error) => {
            console.log('Error connecting to MongoDB:', error.message)
            throw error
        })
}

module.exports = dbConnect