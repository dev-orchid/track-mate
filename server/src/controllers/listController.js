// server/src/controllers/listController.js
const listModel = require('../models/listModel');
const sanitizer = require('../utils/sanitizer');
const logger = require('../utils/logger');

/**
 * Create a new list
 */
exports.createList = async (req, res) => {
  try {
    const { name, description, tags, tag_logic } = req.body;
    const company_id = req.user.company_id;
    const created_by = req.user.userId;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'List name is required'
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizer.sanitizeString(name);
    const sanitizedDescription = description ? sanitizer.sanitizeString(description) : '';

    const listData = {
      name: sanitizedName,
      description: sanitizedDescription,
      company_id,
      created_by,
      tags: tags || [],
      tag_logic: tag_logic || 'any'
    };

    const list = await listModel.createList(listData);

    // Update profile count
    await listModel.updateListProfileCount(list._id);

    const updatedList = await listModel.getListById(list._id, company_id);

    logger.logRequest(req, {
      action: 'list_created',
      list_id: list._id,
      list_unique_id: list.list_id,
      list_name: list.name
    });

    res.status(201).json({
      success: true,
      message: 'List created successfully',
      list: updatedList
    });
  } catch (error) {
    logger.error('Create list error', {
      request_id: req.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all lists
 */
exports.getAllLists = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { limit, skip, search, status } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      search: search || '',
      status: status || 'active'
    };

    const { lists, total } = await listModel.getAllLists(company_id, options);

    res.json({
      success: true,
      lists,
      total,
      page: Math.floor(options.skip / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit)
    });
  } catch (error) {
    logger.error('Get all lists error', {
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
 * Get list by ID
 */
exports.getListById = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const list = await listModel.getListById(id, company_id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    res.json({
      success: true,
      list
    });
  } catch (error) {
    logger.error('Get list by ID error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update list
 */
exports.updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;
    const { name, description, tag_logic, status } = req.body;

    const updateData = {};

    if (name) updateData.name = sanitizer.sanitizeString(name);
    if (description !== undefined) updateData.description = sanitizer.sanitizeString(description);
    if (tag_logic) updateData.tag_logic = tag_logic;
    if (status) updateData.status = status;

    const list = await listModel.updateList(id, company_id, updateData);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Update profile count if tag_logic changed
    if (tag_logic) {
      await listModel.updateListProfileCount(id);
    }

    logger.logRequest(req, {
      action: 'list_updated',
      list_id: list._id
    });

    res.json({
      success: true,
      message: 'List updated successfully',
      list
    });
  } catch (error) {
    logger.error('Update list error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete list
 */
exports.deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    const list = await listModel.deleteList(id, company_id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    logger.logRequest(req, {
      action: 'list_deleted',
      list_id: id
    });

    res.json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    logger.error('Delete list error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add tags to list
 */
exports.addTagsToList = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;
    const company_id = req.user.company_id;

    if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tag_ids array is required'
      });
    }

    const list = await listModel.addTagsToList(id, company_id, tag_ids);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Update profile count
    await listModel.updateListProfileCount(id);

    logger.logRequest(req, {
      action: 'tags_added_to_list',
      list_id: id,
      tag_count: tag_ids.length
    });

    res.json({
      success: true,
      message: `${tag_ids.length} tag(s) added to list`,
      list
    });
  } catch (error) {
    logger.error('Add tags to list error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove tags from list
 */
exports.removeTagsFromList = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;
    const company_id = req.user.company_id;

    if (!tag_ids || !Array.isArray(tag_ids) || tag_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tag_ids array is required'
      });
    }

    const list = await listModel.removeTagsFromList(id, company_id, tag_ids);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Update profile count
    await listModel.updateListProfileCount(id);

    logger.logRequest(req, {
      action: 'tags_removed_from_list',
      list_id: id,
      tag_count: tag_ids.length
    });

    res.json({
      success: true,
      message: `${tag_ids.length} tag(s) removed from list`,
      list
    });
  } catch (error) {
    logger.error('Remove tags from list error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get profiles in a list
 */
exports.getListProfiles = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;
    const { limit, skip } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    };

    const { profiles, total } = await listModel.getListProfiles(id, company_id, options);

    res.json({
      success: true,
      profiles,
      total,
      page: Math.floor(options.skip / options.limit) + 1,
      totalPages: Math.ceil(total / options.limit)
    });
  } catch (error) {
    logger.error('Get list profiles error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Refresh list profile count
 */
exports.refreshListCount = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    // Verify list belongs to company
    const list = await listModel.getListById(id, company_id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    const updatedList = await listModel.updateListProfileCount(id);

    res.json({
      success: true,
      message: 'Profile count updated',
      profile_count: updatedList.profile_count
    });
  } catch (error) {
    logger.error('Refresh list count error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Sync list - assign list tags to all profiles with this list_id
 * This fixes profiles that have list_id but weren't auto-tagged
 */
exports.syncListTags = async (req, res) => {
  try {
    const { id } = req.params;
    const company_id = req.user.company_id;

    // Get the list with tags
    const list = await listModel.getListById(id, company_id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    if (!list.tags || list.tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'List has no tags to sync'
      });
    }

    // Get the list_id (6-char ID like LST-XXXXXX)
    const listId = list.list_id;
    const tagIds = list.tags.map(t => t._id || t.id);

    // Get all profiles with this list_id
    const { db } = require('../utils/dbConnect');
    const { data: profiles, error: profileError } = await db
      .from('profiles')
      .select('id')
      .eq('company_id', company_id)
      .eq('list_id', listId);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return res.json({
        success: true,
        message: 'No profiles found with this list_id',
        synced: 0
      });
    }

    // Add tags to all these profiles
    const profileTagModel = require('../models/profileTagModel');
    const profileIds = profiles.map(p => p.id);

    const result = await profileTagModel.bulkAddTags(
      profileIds,
      tagIds,
      company_id,
      'list_sync'
    );

    // Update tag profile counts
    const tagModel = require('../models/tagModel');
    for (const tagId of tagIds) {
      const count = await profileTagModel.countProfilesWithTag(tagId, company_id);
      await tagModel.updateTag(tagId, company_id, { profile_count: count });
    }

    // Update list profile count
    await listModel.updateListProfileCount(id);

    logger.logRequest(req, {
      action: 'list_tags_synced',
      list_id: id,
      profiles_synced: profileIds.length,
      tags_applied: tagIds.length
    });

    res.json({
      success: true,
      message: `Synced ${tagIds.length} tag(s) to ${profileIds.length} profile(s)`,
      synced: profileIds.length,
      tags: tagIds.length
    });
  } catch (error) {
    logger.error('Sync list tags error', {
      request_id: req.id,
      list_id: req.params.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
