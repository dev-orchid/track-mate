const profileModel = require("../models/profileModel");
const sanitizer = require("../utils/sanitizer");
const logger = require("../utils/logger");

//Profile response from model
exports.profileCreation = async (req, res) => {
    try {
        const profileData = req.body;

        // Sanitize and validate profile data
        const validation = sanitizer.sanitizeProfileData(profileData);

        if (!validation.isValid) {
            logger.logSecurity('profile_creation_validation_failed', {
                request_id: req.id,
                errors: validation.errors,
                ip: req.ip
            });
            return res.status(400).json({
                status: "error",
                message: "Invalid profile data",
                errors: validation.errors
            });
        }

        const responseData = await profileModel.profileCreation(validation.sanitized);

        logger.logRequest(req, {
            action: 'profile_created',
            profile_id: responseData._id
        });

        res.json({ status: "Success", response: responseData });
    } catch (err) {
        logger.error('Profile creation error', {
            request_id: req.id,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ status: "Error", error: err.message });
    }
};
//get profile
exports.getAllProfile = async (req, res) => {
    try {
        // Get company_id from authenticated user
        const company_id = req.user.company_id;
        const data = await profileModel.getAllProfile(company_id);

        logger.logDatabase('get_all_profiles', {
            request_id: req.id,
            company_id: company_id,
            count: data.length
        });

        res.json({ status: "profile fetched", data });
    } catch (err) {
        logger.error('Get all profiles error', {
            request_id: req.id,
            error: err.message
        });
        res.status(500).json({ status: "error", error: err.message });
    }
};
//get profile
exports.getAllProfilesWithEvents = async (req, res) => {
    try {
        // Get company_id from authenticated user
        const company_id = req.user.company_id;
        const data = await profileModel.getAllProfilesWithEvents(company_id);

        logger.logDatabase('get_all_profiles_with_events', {
            request_id: req.id,
            company_id: company_id,
            count: data.length
        });

        res.json({ status: "profile fetched", data });
    } catch (err) {
        logger.error('Get all profiles with events error', {
            request_id: req.id,
            error: err.message
        });
        res.status(500).json({ status: "error", error: err.message });
    }
};

//get profile data by user
exports.getProfileById = async (req, res) => {
  const { id } = req.params;
  // Get company_id from authenticated user to ensure they can only access their own company's profiles
  const company_id = req.user.company_id;

  try {
    const profile = await profileModel.getProfileDataWithEvents(id, company_id);

    if (!profile) {
      logger.logSecurity('profile_access_denied', {
          request_id: req.id,
          profile_id: id,
          company_id: company_id,
          ip: req.ip
      });
      return res
        .status(404)
        .json({ message: "Profile not found or access denied" });
    }

    logger.logDatabase('get_profile_by_id', {
        request_id: req.id,
        profile_id: id,
        company_id: company_id
    });

    // Success: return the profile with its events
    return res.status(200).json(profile);

  } catch (err) {
    logger.error('Get profile by ID error', {
        request_id: req.id,
        profile_id: id,
        error: err.message,
        stack: err.stack
    });
    return res
      .status(500)
      .json({ message: err.message });
  }
};

// Get new profiles for notifications (created in last 24 hours)
exports.getNewProfiles = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { since } = req.query; // Optional timestamp to get profiles since a specific time

    // Default to last 24 hours if no 'since' parameter
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const newProfiles = await profileModel.getNewProfiles(company_id, sinceDate);

    logger.logDatabase('get_new_profiles', {
        request_id: req.id,
        company_id: company_id,
        since: sinceDate,
        count: newProfiles.length
    });

    res.json({
      status: "success",
      count: newProfiles.length,
      data: newProfiles
    });
  } catch (err) {
    logger.error('Get new profiles error', {
        request_id: req.id,
        error: err.message,
        stack: err.stack
    });
    res.status(500).json({ status: "error", error: err.message });
  }
};