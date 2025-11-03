// server/utils/dbConnection.js
const mongoose = require( 'mongoose' );

const MONGODB_URI = process.env.MONGODB_URI; // put your connection string in .env

if ( !MONGODB_URI )
{
    throw new Error( 'MONGODB_URI is not defined. Set it in your environment variables.' );
}

// prevent re-connecting in dev/hot-reload environments
let isConnected = false;

async function connectDB () {
    if ( isConnected ) return;

    try
    {
        await mongoose.connect( MONGODB_URI );

        isConnected = true;
        console.log( 'Connected to MongoDB' );
    } catch ( err )
    {
        console.error( 'Error connecting to MongoDB:', err );
        throw err;
    }
}

module.exports = mongoose;
module.exports.connectDB = connectDB;
