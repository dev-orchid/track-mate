// server/src/routes/marketingRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const tagController = require('../controllers/tagController');
const listController = require('../controllers/listController');
const campaignController = require('../controllers/campaignController');
const { generalApiRateLimiter } = require('../utils/rateLimiter');

// Apply rate limiting to all marketing routes
router.use(generalApiRateLimiter);

// Apply authentication to all routes
router.use(verifyToken);

// ============================================
// TAG ROUTES
// ============================================

// Create tag
router.post('/tags', tagController.createTag);

// Get all tags
router.get('/tags', tagController.getAllTags);

// Get tag by ID
router.get('/tags/:id', tagController.getTagById);

// Update tag
router.put('/tags/:id', tagController.updateTag);

// Delete tag
router.delete('/tags/:id', tagController.deleteTag);

// Add tag to multiple profiles
router.post('/tags/:id/profiles', tagController.addTagToProfiles);

// Remove tag from specific profile
router.delete('/tags/:id/profiles/:profileId', tagController.removeTagFromProfile);

// Get all profiles with a specific tag
router.get('/tags/:id/profiles', tagController.getProfilesByTag);

// ============================================
// LIST ROUTES
// ============================================

// Create list
router.post('/lists', listController.createList);

// Get all lists
router.get('/lists', listController.getAllLists);

// Get list by ID
router.get('/lists/:id', listController.getListById);

// Update list
router.put('/lists/:id', listController.updateList);

// Delete list
router.delete('/lists/:id', listController.deleteList);

// Add tags to list
router.post('/lists/:id/tags', listController.addTagsToList);

// Remove tags from list
router.delete('/lists/:id/tags', listController.removeTagsFromList);

// Get profiles in a list
router.get('/lists/:id/profiles', listController.getListProfiles);

// Refresh list profile count
router.post('/lists/:id/refresh-count', listController.refreshListCount);

// Sync list tags to profiles (assign tags to profiles with this list_id)
router.post('/lists/:id/sync-tags', listController.syncListTags);

// ============================================
// CAMPAIGN ROUTES
// ============================================

// Create campaign
router.post('/campaigns', campaignController.createCampaign);

// Get all campaigns
router.get('/campaigns', campaignController.getAllCampaigns);

// Get campaign by ID
router.get('/campaigns/:id', campaignController.getCampaignById);

// Update campaign (only draft campaigns)
router.put('/campaigns/:id', campaignController.updateCampaign);

// Delete campaign (only draft campaigns)
router.delete('/campaigns/:id', campaignController.deleteCampaign);

// Send or schedule campaign
router.post('/campaigns/:id/send', campaignController.sendCampaign);

// Get campaign statistics
router.get('/campaigns/:id/stats', campaignController.getCampaignStats);

module.exports = router;
