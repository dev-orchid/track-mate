const mongoose = require( '../utils/dbConnect' );
const eventModel = require("../models/eventsModel");

// User Profile Schema

const profileSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    company_id: { type: String, required: true, index: true },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    // Source tracking fields (Klaviyo-style)
    source: {
        type: String,
        enum: ['form', 'api', 'webhook', 'manual', 'import'],
        default: 'api'
    },
    list_id: {
        type: String, // The list_id (LST-XXXXXX) that this profile came from
        default: null
    },
    // Other fields…
});

// Compound indexes for optimized queries
profileSchema.index({ email: 1, company_id: 1 }, { unique: true }); // Unique email per company
profileSchema.index({ company_id: 1, createdAt: -1 }); // For getNewProfiles query
profileSchema.index({ company_id: 1, lastActive: -1 }); // For sorting by lastActive

// 1. Define virtual 'events' that references Event.userId
profileSchema.virtual("events", {
	ref: "Event",
	localField: "_id",
	foreignField: "userId",
	justOne: false,
});

const Profile = mongoose.model("Profile", profileSchema);
//to get all profile from Profile Schema
exports.getAllProfile = async (company_id) => {
	try {
		return await Profile.find({ company_id }, { _id: 0, __v: 0 });
	} catch (err) {
		console.error("Error finding users:", err);
		return [];
	}
};
exports.getAllProfilesWithEvents = async (company_id) => {
	try {
		return await Profile.find({ company_id }, { __v: 0 }) // drop __v; keeps _id by default
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
exports.getProfileDataWithEvents = async (id, company_id) => {
  try {
    const profile = await Profile.findOne({ _id: id, company_id }, { __v: 0 })
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
		// Check if profile already exists with this email and company_id
		const existingProfile = await Profile.findOne({
			email: data.email,
			company_id: data.company_id
		});

		let profile;
		let isNewProfile = false;
		if (existingProfile) {
			// Profile exists - update lastActive and return existing profile
			existingProfile.lastActive = new Date();
			profile = await existingProfile.save();
			console.log(`Profile already exists: ${data.email}, using existing profile`);
		} else {
			// Create new profile
			const responseData = await createProfile(data);
			if (responseData.id !== 1) {
				return responseData; // Return error if creation failed
			}
			profile = responseData.response;
			isNewProfile = true;
		}

		// Link events to this profile (whether new or existing)
		await eventModel.updateUserEvents(data.sessionId, profile._id, data.company_id);

		// If list_id is provided and this is a new profile, auto-assign list tags
		if (isNewProfile && data.list_id) {
			try {
				const listModel = require('./listModel');
				const list = await listModel.getListByListId(data.list_id, data.company_id);

				if (list && list.tags && list.tags.length > 0) {
					// Auto-assign all tags from the list to this profile
					const profileTagModel = require('./profileTagModel');
					const tagIds = list.tags.map(tag => tag._id || tag);

					for (const tagId of tagIds) {
						try {
							await profileTagModel.addTagToProfile(
								profile._id,
								tagId,
								data.company_id,
								'form', // added_by = 'form' since it came from list signup
								{ source_list: data.list_id }
							);
						} catch (tagErr) {
							// Tag might already exist, ignore duplicate errors
							console.log(`Tag ${tagId} already assigned to profile ${profile._id}`);
						}
					}
					console.log(`Auto-assigned ${tagIds.length} tags from list ${data.list_id} to profile ${profile._id}`);
				}
			} catch (listErr) {
				console.error('Error auto-assigning list tags:', listErr);
				// Don't fail the whole operation if tag assignment fails
			}
		}

		return {
			id: 1,
			status: "Success",
			response: profile,
		};
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

// Get new profiles created since a specific date
exports.getNewProfiles = async (company_id, sinceDate) => {
	try {
		return await Profile.find({
			company_id: company_id,
			createdAt: { $gte: sinceDate }
		})
		.select('name email phone createdAt lastActive _id')
		.sort({ createdAt: -1 }) // Newest first
		.limit(50); // Limit to 50 notifications
	} catch (err) {
		console.error("Error fetching new profiles:", err);
		return [];
	}
};
