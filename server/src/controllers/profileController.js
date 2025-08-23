const profileModel = require("../models/profileModel");

//Profile response from model
exports.profileCreation = async (req, res) => {
    try {
        const profileData = req.body;
        const responseData = await profileModel.profileCreation(profileData);
        res.json({ status: "Success", response: responseData });
    } catch (err) {
        res.status(500).json({ status: "Error", error: err });
    }
};
//get profile
exports.getAllProfile = async (req, res) => {
    const data = await profileModel.getAllProfile();
    console.log(data);
    res.json({ status: "profile fetched", data });
};
//get profile
exports.getAllProfilesWithEvents = async (req, res) => {
    const data = await profileModel.getAllProfilesWithEvents();
    console.log(data);
    res.json({ status: "profile fetched", data });
};

//get profile data by user
exports.getProfileById = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await profileModel.getProfileDataWithEvents(id);

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found" });
    }

    // Success: return the profile with its events
    return res.status(200).json(profile);

  } catch (err) {
    console.error("Error in getProfileById:", err);
    return res
      .status(500)
      .json({ message: err.message });
  }
};