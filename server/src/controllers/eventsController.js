const eventsModel = require("../models/eventsModel");

exports.getAllTracking = async (req, res) => {
	const data = await eventsModel.getAllEvent();
	const { eventId } = req.params;
	// In a real-world scenario, you would look up the event in your database.
	const trackingEvent = {
		id: eventId,
		name: "User Login",
		timestamp: new Date().toISOString(),
	};
	console.log(data);
	res.json({ status: "successkedar", data });
};
//event creation
exports.createEvent = async (req, res) => {
	try {
		const eventData = req.body;
		const responseData = await eventsModel.eventCreation(eventData);
		res.json({ status: "success", data: responseData });
	} catch (err) {
		console.error("Error in createTracking:", err);
		res.status(500).json({ status: "error", error: err });
	}
};

