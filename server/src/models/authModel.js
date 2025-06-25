// server/models/Account.js
const mongoose = require('mongoose');
mongoose
  .connect(
    "mongodb+srv://dhruvakedar:LlN9ZSfKhJovOPMm@nascluster.hhmccnc.mongodb.net/track_mate?retryWrites=true&w=majority&appName=NasCluster",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));
const AccountSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
    },
     email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
    },
    company_name: {
      type: String,
      required: [true, 'Please enter your conmpany name'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Account || mongoose.model('Account', AccountSchema);
