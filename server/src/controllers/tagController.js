// server/src/controllers/tagController.js
// Supabase version
const tagModel = require('../models/tagModel');
const profileTagModel = require('../models/profileTagModel');
const sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');
const { db } = require('../utils/dbConnect');

/**
 * Create a new tag
 */
exports.createTag = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const company_id = req.user.company_id;
    const created_by = req.user.userId;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizer.sanitizeString(name);
    const sanitizedDescription = description ? sanitizer.sanitizeString(description) : '';

    const tagData = {
      name: sanitizedName,
      company_id,
      color: color || '#3B82F6',
      description: sanitizedDescription,
      created_by
    };

    const tag = await tagModel.createTag(tagData);

    logger.logRequest(req, {
      action: 'tag_created',
      tag_id: tag._id,
      tag_name: tag.name
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      tag
    });
  } catch (error) {
    logger.error('Create tag error', {
      request_id: req.id,
      error: error.message,
      stack: error.stack
    });

    // Handle duplicate tag name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all tags
 */
exports.getAllTags = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { limit, skip, search } = req.query;

    const options = {
      limit: parseInt(limit) || 100,
      skip: parseInt(skip) || 0,
      search: search || ''
    };

    const { tags, total } = await tagModel.getAllTags(company_id, options);

    res.json({
      success: true,
      tags,
      total,
      page: Math.floor(options.skip / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit)
    });
  } catch (error) {
    logger.error('Get all tags error', {
      request_id: req.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get tag by ID
 */
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const tag = await tagModel.getTagById(id, company_id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      tag
    });
  } catch (error) {
    logger.error('Get tag by ID error', {
      request_id: req.id,
      tag_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update tag
 */
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;
    const { name, color, description } = req.body;

    const updateData = {};

    if (name) updateData.name = sanitizer.sanitizeString(name);
    if (color) updateData.color = color;
    if (description !== undefined) updateData.description = sanitizer.sanitizeString(description);

    const tag = await tagModel.updateTag(id, company_id, updateData);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    logger.logRequest(req, {
      action: 'tag_updated',
      tag_id: tag._id
    });

    res.json({
      success: true,
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    logger.error('Update tag error', {
      request_id: req.id,
      tag_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete tag
 */
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    // Delete all profile-tag relationships using Supabase query
    await db
      .from('profile_tags')
      .delete()
      .eq('tag_id', id)
      .eq('company_id', company_id);

    // Also delete from list_tags
    await db
      .from('list_tags')
      .delete()
      .eq('tag_id', id);

    const tag = await tagModel.deleteTag(id, company_id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    logger.logRequest(req, {
      action: 'tag_deleted',
      tag_id: id
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    logger.error('Delete tag error', {
      request_id: req.id,
      tag_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add tag to profiles
 */
exports.addTagToProfiles = async (req, res) => {
  try {
    const { id } = req.params; // tag ID
    const { profile_ids } = req.body; // Array of profile IDs
    const company_id = req.user.company_id;

    if (!profile_ids || !Array.isArray(profile_ids) || profile_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'profile_ids array is required'
      });
    }

    // Add tag to all profiles
    const result = await profileTagModel.bulkAddTags(profile_ids, [id], company_id, 'manual');

    // Update tag profile count
    const count = await profileTagModel.countProfilesWithTag(id, company_id);
    await tagModel.updateTag(id, company_id, { profile_count: count });

    logger.logRequest(req, {
      action: 'tag_added_to_profiles',
      tag_id: id,
      profile_count: profile_ids.length
    });

    res.json({
      success: true,
      message: `Tag added to ${profile_ids.length} profile(s)`,
      inserted_count: result.insertedCount
    });
  } catch (error) {
    logger.error('Add tag to profiles error', {
      request_id: req.id,
      tag_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove tag from profile
 */
exports.removeTagFromProfile = async (req, res) => {
  try {
    const { id, profileId } = req.params; // tag ID and profile ID
    const company_id = req.user.company_id;

    const result = await profileTagModel.removeTagFromProfile(profileId, id, company_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Tag-Profile relationship not found'
      });
    }

    // Update tag profile count
    const count = await profileTagModel.countProfilesWithTag(id, company_id);
    await tagModel.updateTag(id, company_id, { profile_count: count });

    logger.logRequest(req, {
      action: 'tag_removed_from_profile',
      tag_id: id,
      profile_id: profileId
    });

    res.json({
      success: true,
      message: 'Tag removed from profile'
    });
  } catch (error) {
    logger.error('Remove tag from profile error', {
      request_id: req.id,
      tag_id: req.params.id,
      profile_id: req.params.profileId,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get profiles with a specific tag
 */
exports.getProfilesByTag = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;
    const { limit, skip } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    };

    const { profiles, total } = await profileTagModel.getProfilesByTag(id, company_id, options);

    res.json({
      success: true,
      profiles,
      total,
      page: Math.floor(options.skip / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit)
    });
  } catch (error) {
    logger.error('Get profiles by tag error', {
      request_id: req.id,
      tag_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
