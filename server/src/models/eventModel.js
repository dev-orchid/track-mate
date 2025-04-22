const UserEventsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "UserProfile",
		default: null,
	},
	sessionId: String,
	events: [
		{
			eventType: { type: String, required: true },
			eventData: {
				address: { type: String },
				productInfos: [
					{
						productName: { type: String },
						price: { type: Number },
						productId: { type: String },
					},
				],
			},
			timestamp: { type: Date, default: Date.now },
		},
	],
});

const UserEvents = mongoose.model("UserEvents", UserEventsSchema);
//second steps
app.patch("/api/user-events/:id/add-event", async (req, res) => {
	const documentId = req.params.id;
	const { eventType, eventData } = req.body;

	if (!eventType) {
		return res
			.status(400)
			.json({ error: "Missing eventType in request body." });
	}

	try {
		const updatedDoc = await UserEvents.findByIdAndUpdate(
			documentId,
			{
				$push: {
					events: { eventType, eventData, timestamp: new Date() },
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedDoc) {
			return res
				.status(404)
				.json({ error: "User events document not found." });
		}

		res.status(200).json(updatedDoc);
	} catch (error) {
		console.error("Error updating user events document:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
