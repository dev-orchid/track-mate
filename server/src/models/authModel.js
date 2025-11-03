// server/models/Account.js
const mongoose = require( '../utils/dbConnect' );
const AccountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [ true, 'Please provide a first name' ],
    },
    lastName: {
      type: String,
      required: [ true, 'Please provide a last name' ],
    },
    email: {
      type: String,
      required: [ true, 'Please provide an email' ],
      unique: true,
    },
    company_name: {
      type: String,
      required: [ true, 'Please enter your conmpany name' ],
    },
    company_id: {
      type: String,
      required: [ true, 'Please enter your conmpany id' ],
    },
    password: {
      type: String,
      required: [ true, 'Please provide a password' ],
    },
    refreshToken: {
      type: String,
      default: null, // initially empty
    },
    api_key: {
      type: String,
      unique: true,
      index: true,
    },
    api_key_created_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Account || mongoose.model( 'Account', AccountSchema );
