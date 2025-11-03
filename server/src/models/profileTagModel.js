// server/src/models/profileTagModel.js
const mongoose = require('../utils/dbConnect');

const profileTagSchema = new mongoose.Schema({
  profile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  tag_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  },
  company_id: {
    type: String,
    required: true,
    index: true
  },
  added_by: {
    type: String,
    enum: ['manual', 'automation', 'api', 'event'],
    default: 'manual'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Compound indexes for efficient queries
profileTagSchema.index({ profile_id: 1, tag_id: 1, company_id: 1 }, { unique: true });
profileTagSchema.index({ tag_id: 1, company_id: 1 });
profileTagSchema.index({ profile_id: 1, company_id: 1 });
profileTagSchema.index({ company_id: 1, created_at: -1 });

const ProfileTag = mongoose.model('ProfileTag', profileTagSchema);

/**
 * Add tag to profile
 */
exports.addTagToProfile = async (profileId, tagId, company_id, added_by = 'manual', metadata = {}) => {
  try {
    const profileTag = new ProfileTag({
      profile_id: profileId,
      tag_id: tagId,
      company_id,
      added_by,
      metadata
    });
    return await profileTag.save();
  } catch (error) {
    // If duplicate, return existing
    if (error.code === 11000) {
      return await ProfileTag.findOne({ profile_id: profileId, tag_id: tagId, company_id });
    }
    throw error;
  }
};

/**
 * Remove tag from profile
 */
exports.removeTagFromProfile = async (profileId, tagId, company_id) => {
  try {
    return await ProfileTag.findOneAndDelete({
      profile_id: profileId,
      tag_id: tagId,
      company_id
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tags for a profile
 */
exports.getProfileTags = async (profileId, company_id) => {
  try {
    return await ProfileTag.find({ profile_id: profileId, company_id })
      .populate('tag_id')
      .lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all profiles with a specific tag
 */
exports.getProfilesByTag = async (tagId, company_id, options = {}) => {
  try {
    const { limit = 50, skip = 0 } = options;

    const profileTags = await ProfileTag.find({ tag_id: tagId, company_id })
      .limit(limit)
      .skip(skip)
      .populate('profile_id')
      .lean();

    const total = await ProfileTag.countDocuments({ tag_id: tagId, company_id });

    return {
      profiles: profileTags.map(pt => pt.profile_id).filter(p => p !== null),
      total
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get profiles by multiple tags with AND/OR logic
 */
exports.getProfilesByTags = async (tagIds, company_id, logic = 'any', options = {}) => {
  try {
    const { limit = 50, skip = 0 } = options;

    let profileIds;

    if (logic === 'all') {
      // AND logic - profile must have ALL tags
      const pipeline = [
        { $match: { tag_id: { $in: tagIds.map(id => mongoose.Types.ObjectId(id)) }, company_id } },
        { $group: { _id: '$profile_id', count: { $sum: 1 } } },
        { $match: { count: tagIds.length } },
        { $skip: skip },
        { $limit: limit }
      ];

      const results = await ProfileTag.aggregate(pipeline);
      profileIds = results.map(r => r._id);
    } else {
      // OR logic - profile must have ANY of the tags
      const profileTags = await ProfileTag.find({
        tag_id: { $in: tagIds },
        company_id
      })
        .distinct('profile_id')
        .limit(limit)
        .skip(skip);

      profileIds = profileTags;
    }

    const Profile = mongoose.model('Profile');
    const profiles = await Profile.find({ _id: { $in: profileIds }, company_id }).lean();

    return { profiles, total: profiles.length };
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk add tags to multiple profiles
 */
exports.bulkAddTags = async (profileIds, tagIds, company_id, added_by = 'manual') => {
  try {
    const operations = [];

    for (const profileId of profileIds) {
      for (const tagId of tagIds) {
        operations.push({
          updateOne: {
            filter: { profile_id: profileId, tag_id: tagId, company_id },
            update: {
              $setOnInsert: {
                profile_id: profileId,
                tag_id: tagId,
                company_id,
                added_by,
                created_at: new Date()
              }
            },
            upsert: true
          }
        });
      }
    }

    return await ProfileTag.bulkWrite(operations);
  } catch (error) {
    throw error;
  }
};

/**
 * Remove all tags from a profile
 */
exports.removeAllTagsFromProfile = async (profileId, company_id) => {
  try {
    return await ProfileTag.deleteMany({ profile_id: profileId, company_id });
  } catch (error) {
    throw error;
  }
};

/**
 * Count profiles with a specific tag
 */
exports.countProfilesWithTag = async (tagId, company_id) => {
  try {
    return await ProfileTag.countDocuments({ tag_id: tagId, company_id });
  } catch (error) {
    throw error;
  }
};

// Export the model
exports.ProfileTag = ProfileTag;
