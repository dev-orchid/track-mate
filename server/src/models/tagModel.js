// server/src/models/tagModel.js
const mongoose = require('../utils/dbConnect');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  company_id: {
    type: String,
    required: true,
    index: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  description: {
    type: String,
    default: ''
  },
  profile_count: {
    type: Number,
    default: 0
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

// Compound index for unique tag name per company
tagSchema.index({ name: 1, company_id: 1 }, { unique: true });
tagSchema.index({ company_id: 1, created_at: -1 });

const Tag = mongoose.model('Tag', tagSchema);

/**
 * Create a new tag
 */
exports.createTag = async (tagData) => {
  try {
    const tag = new Tag(tagData);
    return await tag.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tags for a company
 */
exports.getAllTags = async (company_id, options = {}) => {
  try {
    const { limit = 100, skip = 0, search = '' } = options;

    const query = { company_id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tags = await Tag.find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Tag.countDocuments(query);

    return { tags, total };
  } catch (error) {
    throw error;
  }
};

/**
 * Get tag by ID
 */
exports.getTagById = async (tagId, company_id) => {
  try {
    return await Tag.findOne({ _id: tagId, company_id }).lean();
  } catch (error) {
    throw error;
  }
};

/**
 * Update tag
 */
exports.updateTag = async (tagId, company_id, updateData) => {
  try {
    updateData.updated_at = new Date();
    return await Tag.findOneAndUpdate(
      { _id: tagId, company_id },
      { $set: updateData },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete tag
 */
exports.deleteTag = async (tagId, company_id) => {
  try {
    return await Tag.findOneAndDelete({ _id: tagId, company_id });
  } catch (error) {
    throw error;
  }
};

/**
 * Increment profile count
 */
exports.incrementProfileCount = async (tagId, increment = 1) => {
  try {
    return await Tag.findByIdAndUpdate(
      tagId,
      { $inc: { profile_count: increment } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

// Export the model
exports.Tag = Tag;
