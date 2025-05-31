const mongoose = require("mongoose");
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

// User Profile Schema
const profileSchema = new mongoose.Schema({
	name: String,
	email: String,
	phone: Number,
	lastActive: { type: Date, default: Date.now },
	// Other fields…
});


//New Event Schema
const EventSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Profile",
		default: null,
	},
	sessionId: { type: String, required: true },
	events: [
		{
			eventType: { type: String, required: true },
			eventData: {
				address: { type: String },
				productInfos: [
					{
						productName: { type: String },
						price: { type: Number },
						productId: { type: String },
					},
				],
			},
			timestamp: { type: Date, default: Date.now },
		},
	],
});

//End
const Profile = mongoose.model("Profile", profileSchema);
const Event = mongoose.model("Event", EventSchema);

//to get profile data from db
exports.getAll = async () => {
    try {
        return await Event.find({},{_id:0,__v:0 }).populate('userId');
    } catch (err) {
        console.error("Error finding users:", err);
        return [];
    }
};

async function insertEvents(eventData) {
	try {
		const responseData = await new Event(eventData).save();
		return {
			id: 1,
			status: "ok",
			response: responseData,
		};
	} catch (err) {
		console.log("Error on Profile creation:", err);
		return {
			id: 2,
			status: "Error",
			response: err,
		};
		//throw err;
	}
}

//to insert data in response to controller
exports.eventCreation = async (event) => {
	try {
		const response = await insertEvents(event);
		return response;
	} catch (err) {
		console.error("Insert error:", err);
		// Optionally return an error object or rethrow the error
		return { id: 2, status: "Error", response: err };
	}
};

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
//Export profile response to controller
exports.profileCreation = async (data) => {
	try {
		const responseData = await createProfile(data);
		//console.log(responseData.response._id)
		await updateUserEvents(data.sessionId, responseData.response._id);
		return responseData;
	} catch (err) {
		return { id: 2, status: "Error", response: err };
	}
};
// End Profile Creation
// Update Events User Id after profile creation
const updateUserEvents = async (sessionId, userId) => {
	try {
		const result = await Event.updateMany(
			{ sessionId, userId: { $in: [null, undefined] } },
			{ $set: { userId } }
		);
		console.log(`Updated ${sessionId + "--" + userId} events.`);
	} catch (error) {
		console.error("Error updating events:", error);
	}
};
