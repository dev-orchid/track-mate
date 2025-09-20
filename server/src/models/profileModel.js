const mongoose = require( '../utils/dbConnect' );
const eventModel = require("../models/eventsModel");

// User Profile Schema

const profileSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    lastActive: { type: Date, default: Date.now },
    // Other fields…
});
// 1. Define virtual 'events' that references Event.userId
profileSchema.virtual("events", {
	ref: "Event",
	localField: "_id",
	foreignField: "userId",
	justOne: false,
});

const Profile = mongoose.model("Profile", profileSchema);
//to get all profile from Profile Schema
exports.getAllProfile = async () => {
	try {
		return await Profile.find({}, { _id: 0, __v: 0 });
	} catch (err) {
		console.error("Error finding users:", err);
		return [];
	}
};
exports.getAllProfilesWithEvents = async () => {
	try {
		return await Profile.find({}, { __v: 0 }) // drop __v; keeps _id by default
			.populate({
				path: "events", // the virtual we defined
				select: "-_id -__v", // drop _id & __v in events
			})
			.lean({ virtuals: true });
	} catch (err) {
		console.error("Error fetching profiles with events:", err);
		return [];
	}
};
exports.getProfileDataWithEvents = async (id) => {
  try {
    const profile = await Profile.findById(id, { __v: 0 })
      .populate({
        path: "events",           // virtual populated from Event.userId
        select: "-_id -__v",      // drop _id and __v from each event
      })
      .lean({ virtuals: true });  // include virtuals in the lean result

    return profile;              // either an object or null
  } catch (err) {
    console.error("Error fetching profile with events by id:", err);
    throw err;                   // let caller handle the error
  }
};
//Export profile response to controller
exports.profileCreation = async (data) => {
	try {
		const responseData = await createProfile(data);
		//console.log(responseData.response._id)
		await eventModel.updateUserEvents(data.sessionId, responseData.response._id);
		return responseData;
	} catch (err) {
		return { id: 2, status: "Error", response: err };
	}
};
// End Profile Creation
//Create profile for trackMate
async function createProfile(profileData) {
	//console.log(profileData)
	try {
		const response = await new Profile(profileData).save();
		// Usage after user registration:
		return {
			id: 1,
			status: "Success",
			response: response,
		};
	} catch (err) {
		return {
			id: 2,
			status: "Error",
			response: err,
		};
	}
}
