const eventsModel = require("../models/eventsModel");
const sanitizer = require("../utils/sanitizer");
const logger = require("../utils/logger");

exports.getAllTracking = async (req, res) => {
	try {
		// Get company_id from authenticated user
		const company_id = req.user.company_id;
		const data = await eventsModel.getAllEvent(company_id);
		const { eventId } = req.params;
		// In a real-world scenario, you would look up the event in your database.
		const trackingEvent = {
			id: eventId,
			name: "User Login",
			timestamp: new Date().toISOString(),
		};

		logger.logDatabase('get_all_events', {
			request_id: req.id,
			company_id: company_id,
			count: data.length
		});

		res.json({ status: "success", data });
	} catch (err) {
		logger.error('Get all tracking error', {
			request_id: req.id,
			error: err.message,
			stack: err.stack
		});
		res.status(500).json({ status: "error", error: err.message });
	}
};
//event creation
exports.createEvent = async (req, res) => {
	try {
		const eventData = req.body;

		// Sanitize and validate event data
		const validation = sanitizer.sanitizeEventData(eventData);

		if (!validation.isValid) {
			logger.logSecurity('event_creation_validation_failed', {
				request_id: req.id,
				errors: validation.errors,
				ip: req.ip
			});
			return res.status(400).json({
				status: "error",
				message: "Invalid event data",
				errors: validation.errors
			});
		}

		const responseData = await eventsModel.eventCreation(validation.sanitized);

		logger.logRequest(req, {
			action: 'event_created',
			event_id: responseData._id,
			event_type: validation.sanitized.events?.[0]?.eventType
		});

		res.json({ status: "success", data: responseData });
	} catch (err) {
		logger.error('Event creation error', {
			request_id: req.id,
			error: err.message,
			stack: err.stack
		});
		res.status(500).json({ status: "error", error: err.message });
	}
};

