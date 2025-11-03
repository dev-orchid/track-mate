// server/src/models/listModel.js
const mongoose = require('../utils/dbConnect');
const generateListId = require('../utils/generateListId');

const listSchema = new mongoose.Schema({
  list_id: {
    type: String,
    unique: true,
    uppercase: true
  },
  company_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Tags assigned to this list - profiles with ANY of these tags will be included
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  tag_logic: {
    type: String,
    enum: ['any', 'all'], // 'any' = OR logic, 'all' = AND logic
    default: 'any'
  },
  // Cached profile count for performance
  profile_count: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes
listSchema.index({ company_id: 1, created_at: -1 });
listSchema.index({ company_id: 1, status: 1 });

// Pre-save hook to generate list_id
listSchema.pre('save', async function(next) {
  if (!this.list_id) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      this.list_id = generateListId();

      // Check if this ID already exists
      const existing = await mongoose.model('List').findOne({ list_id: this.list_id });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error('Failed to generate unique list ID'));
    }
  }
  next();
});

const List = mongoose.model('List', listSchema);

/**
 * Create a new list
 */
exports.createList = async (listData) => {
  try {
    const list = new List(listData);
    return await list.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all lists for a company
 */
exports.getAllLists = async (company_id, options = {}) => {
  try {
    const { limit = 50, skip = 0, search = '', status = 'active' } = options;

    const query = { company_id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const lists = await List.find(query)
      .populate('tags')
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await List.countDocuments(query);

    return { lists, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Get list by ID
 */
exports.getListById = async (listId, company_id) => {
  try {
    return await List.findOne({ _id: listId, company_id })
      .populate('tags')
      .lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Get list by list_id (6-char ID)
 */
exports.getListByListId = async (list_id, company_id) => {
  try {
    return await List.findOne({ list_id, company_id })
      .populate('tags')
      .lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Update list
 */
exports.updateList = async (listId, company_id, updateData) => {
  try {
    updateData.updated_at = new Date();
    return await List.findOneAndUpdate(
      { _id: listId, company_id },
      { $set: updateData },
      { new: true }
    ).populate('tags');
  } catch (error) {
    throw error;
  }
};

/**
 * Delete list
 */
exports.deleteList = async (listId, company_id) => {
  try {
    return await List.findOneAndDelete({ _id: listId, company_id });
  } catch (error) {
    throw error;
  }
};

/**
 * Add tags to list
 */
exports.addTagsToList = async (listId, company_id, tagIds) => {
  try {
    return await List.findOneAndUpdate(
      { _id: listId, company_id },
      {
        $addToSet: { tags: { $each: tagIds } },
        $set: { updated_at: new Date() }
      },
      { new: true }
    ).populate('tags');
  } catch (error) {
    throw error;
  }
};

/**
 * Remove tags from list
 */
exports.removeTagsFromList = async (listId, company_id, tagIds) => {
  try {
    return await List.findOneAndUpdate(
      { _id: listId, company_id },
      {
        $pull: { tags: { $in: tagIds } },
        $set: { updated_at: new Date() }
      },
      { new: true }
    ).populate('tags');
  } catch (error) {
    throw error;
  }
};

/**
 * Get profiles for a list (based on assigned tags)
 */
exports.getListProfiles = async (listId, company_id, options = {}) => {
  try {
    const { limit = 50, skip = 0 } = options;

    // Get the list with tags
    const list = await List.findOne({ _id: listId, company_id });
    if (!list || list.tags.length === 0) {
      return { profiles: [], total: 0 };
    }

    // Get profiles based on tag logic
    const ProfileTag = require('./profileTagModel').ProfileTag;
    const Profile = mongoose.model('Profile');

    let profileIds;

    if (list.tag_logic === 'all') {
      // AND logic - profile must have ALL tags
      const pipeline = [
        {
          $match: {
            tag_id: { $in: list.tags },
            company_id
          }
        },
        {
          $group: {
            _id: '$profile_id',
            count: { $sum: 1 }
          }
        },
        { $match: { count: list.tags.length } }
      ];

      const results = await ProfileTag.aggregate(pipeline);
      profileIds = results.map(r => r._id);
    } else {
      // OR logic - profile must have ANY of the tags
      profileIds = await ProfileTag.distinct('profile_id', {
        tag_id: { $in: list.tags },
        company_id
      });
    }

    const profiles = await Profile.find({
      _id: { $in: profileIds },
      company_id
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = profileIds.length;

    return { profiles, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Update profile count for a list
 */
exports.updateListProfileCount = async (listId) => {
  try {
    const list = await List.findById(listId);
    if (!list) return null;

    const { total } = await exports.getListProfiles(listId, list.company_id, { limit: 1 });

    return await List.findByIdAndUpdate(
      listId,
      { $set: { profile_count: total, updated_at: new Date() } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

// Export the model
exports.List = List;
