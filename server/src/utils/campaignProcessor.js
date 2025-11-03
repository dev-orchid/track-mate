// server/src/utils/campaignProcessor.js
const campaignModel = require('../models/campaignModel');
const listModel = require('../models/listModel');
const logger = require('./logger');

/**
 * Process a campaign and send emails to all profiles in the list
 * This function processes the campaign in batches to avoid memory issues
 */
exports.processCampaign = async (campaignId) => {
  try {
    logger.info('Campaign processing started', {
      campaign_id: campaignId
    });

    // Get campaign details
    const campaign = await campaignModel.Campaign.findById(campaignId)
      .populate('list_id')
      .populate('created_by', 'firstName lastName email');

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Update status to sending
    await campaignModel.updateCampaignStatus(campaignId, 'sending');

    // Get all profiles from the list
    const { profiles, total } = await listModel.getListProfiles(
      campaign.list_id._id,
      campaign.company_id,
      { limit: 1000000, skip: 0 } // Get all profiles
    );

    logger.info('Campaign recipients fetched', {
      campaign_id: campaignId,
      total_recipients: total
    });

    if (total === 0) {
      await campaignModel.updateCampaignStatus(campaignId, 'failed', {
        last_error: 'No recipients found in the list'
      });
      return;
    }

    // Update total recipients
    await campaignModel.updateCampaign(campaignId, campaign.company_id, {
      total_recipients: total
    });

    // Process emails in batches
    const BATCH_SIZE = 100;
    let sent_count = 0;
    let failed_count = 0;

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);

      // Send emails to this batch
      const results = await Promise.allSettled(
        batch.map(profile => sendEmail(campaign, profile))
      );

      // Count successes and failures
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          sent_count++;
        } else {
          failed_count++;
          logger.error('Email send failed', {
            campaign_id: campaignId,
            error: result.reason
          });
        }
      });

      // Update campaign stats after each batch
      await campaignModel.Campaign.findByIdAndUpdate(
        campaignId,
        {
          $set: {
            sent_count,
            failed_count,
            delivered_count: sent_count // Assume delivered for now (would be updated by email service webhook)
          }
        }
      );

      logger.info('Campaign batch processed', {
        campaign_id: campaignId,
        batch_number: Math.floor(i / BATCH_SIZE) + 1,
        sent_count,
        failed_count
      });
    }

    // Mark campaign as sent
    await campaignModel.updateCampaignStatus(campaignId, 'sent', {
      sent_at: new Date()
    });

    logger.info('Campaign processing completed', {
      campaign_id: campaignId,
      total_recipients: total,
      sent_count,
      failed_count
    });

    return {
      success: true,
      sent_count,
      failed_count,
      total: total
    };
  } catch (error) {
    logger.error('Campaign processing error', {
      campaign_id: campaignId,
      error: error.message,
      stack: error.stack
    });

    // Mark campaign as failed
    await campaignModel.updateCampaignStatus(campaignId, 'failed', {
      last_error: error.message
    });

    throw error;
  }
};

/**
 * Send email to a single profile
 * This is a placeholder - you'll integrate with SendGrid, AWS SES, or other email service
 */
async function sendEmail(campaign, profile) {
  try {
    // For now, this is a placeholder
    // In production, you would integrate with an email service like SendGrid

    logger.info('Email would be sent', {
      campaign_id: campaign._id,
      profile_id: profile._id,
      to: profile.email,
      subject: campaign.subject
    });

    // TODO: Integrate with email service
    // Example for SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: profile.email,
      from: {
        email: campaign.from_email,
        name: campaign.from_name
      },
      replyTo: campaign.reply_to || campaign.from_email,
      subject: personalizeContent(campaign.subject, profile),
      html: personalizeContent(campaign.html_content, profile),
      text: personalizeContent(campaign.text_content, profile),
      customArgs: {
        campaign_id: campaign._id.toString(),
        profile_id: profile._id.toString(),
        company_id: campaign.company_id
      }
    };

    await sgMail.send(msg);
    */

    return { success: true, profile_id: profile._id };
  } catch (error) {
    throw new Error(`Failed to send email to ${profile.email}: ${error.message}`);
  }
}

/**
 * Personalize email content with profile data
 * Replaces placeholders like {{name}}, {{email}}, etc.
 */
function personalizeContent(content, profile) {
  if (!content) return '';

  let personalized = content;

  // Replace common placeholders
  const replacements = {
    '{{name}}': profile.name || 'there',
    '{{email}}': profile.email || '',
    '{{phone}}': profile.phone || '',
    '{{first_name}}': profile.name ? profile.name.split(' ')[0] : 'there'
  };

  Object.keys(replacements).forEach(placeholder => {
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    personalized = personalized.replace(regex, replacements[placeholder]);
  });

  return personalized;
}

/**
 * Check for scheduled campaigns and process them
 * This function should be called periodically (e.g., every minute via cron)
 */
exports.processScheduledCampaigns = async () => {
  try {
    const campaigns = await campaignModel.getCampaignsToSend();

    logger.info('Checking for scheduled campaigns', {
      count: campaigns.length
    });

    for (const campaign of campaigns) {
      // Process each campaign asynchronously
      exports.processCampaign(campaign._id).catch(error => {
        logger.error('Scheduled campaign processing failed', {
          campaign_id: campaign._id,
          error: error.message
        });
      });
    }
  } catch (error) {
    logger.error('Process scheduled campaigns error', {
      error: error.message,
      stack: error.stack
    });
  }
};

// Export personalization helper for testing
exports.personalizeContent = personalizeContent;
