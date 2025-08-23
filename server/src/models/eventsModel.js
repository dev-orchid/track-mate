const mongoose = require("mongoose");

mongoose
    .connect(
        "mongodb+srv://dhruvakedar:LlN9ZSfKhJovOPMm@nascluster.hhmccnc.mongodb.net/track_mate?retryWrites=true&w=majority&appName=NasCluster",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));



//New Event Schema
const EventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
    },
    sessionId: { type: String, required: true },
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

//End
const Event = mongoose.model("Event", EventSchema);

//to get Event data from Event Schema
exports.getAllEvent = async () => {
    try {
        return await Event.find({}, { _id: 0, __v: 0 }).populate("userId");
    } catch (err) {
        console.error("Error finding users:", err);
        return [];
    }
};


async function insertEvents(eventData) {
    try {
        const responseData = await new Event(eventData).save();
        return {
            id: 1,
            status: "ok",
            response: responseData,
        };
    } catch (err) {
        console.log("Error on Profile creation:", err);
        return {
            id: 2,
            status: "Error",
            response: err,
        };
        //throw err;
    }
}

//to insert data in response to controller
exports.eventCreation = async (event) => {
    try {
        const response = await insertEvents(event);
        return response;
    } catch (err) {
        console.error("Insert error:", err);
        // Optionally return an error object or rethrow the error
        return { id: 2, status: "Error", response: err };
    }
};



// Update Events User Id after profile creation
const updateUserEvents = async (sessionId, userId) => {
    try {
        const result = await Event.updateMany(
            { sessionId, userId: { $in: [null, undefined] } },
            { $set: { userId } }
        );
        console.log(`Updated ${sessionId + "--" + userId} events.`);
    } catch (error) {
        console.error("Error updating events:", error);
    }
};
