// check-events-detail.js - Check detailed event data
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const COMPANY_ID = 'TM-YXL25';

async function checkEventDetails() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const db = mongoose.connection.db;

        // Get all events
        const events = await db.collection('events').find({ company_id: COMPANY_ID }).toArray();

        console.log(`📊 Event Documents for ${COMPANY_ID}:\n`);

        events.forEach((eventDoc, index) => {
            console.log(`Event Document ${index + 1}:`);
            console.log(`  SessionId: ${eventDoc.sessionId}`);
            console.log(`  UserId: ${eventDoc.userId || 'null (anonymous)'}`);
            console.log(`  Company: ${eventDoc.company_id}`);
            console.log(`  Events in this document: ${eventDoc.events.length}`);

            eventDoc.events.forEach((evt, i) => {
                console.log(`    Event ${i + 1}:`);
                console.log(`      Type: ${evt.eventType}`);
                console.log(`      Address: ${evt.eventData?.address || 'N/A'}`);
                console.log(`      Timestamp: ${new Date(evt.timestamp).toLocaleString()}`);
                console.log(`      Products: ${evt.eventData?.productInfos?.length || 0}`);
            });
            console.log('');
        });

        // Check for duplicate page views
        console.log('\n🔍 Checking for duplicate events...\n');

        const eventsByType = {};
        events.forEach(eventDoc => {
            eventDoc.events.forEach(evt => {
                const key = `${evt.eventType}-${evt.eventData?.address}`;
                if (!eventsByType[key]) {
                    eventsByType[key] = [];
                }
                eventsByType[key].push({
                    timestamp: evt.timestamp,
                    sessionId: eventDoc.sessionId,
                    userId: eventDoc.userId
                });
            });
        });

        for (const [key, occurrences] of Object.entries(eventsByType)) {
            if (occurrences.length > 1) {
                console.log(`⚠️  Duplicate: ${key}`);
                console.log(`   Found ${occurrences.length} times:`);
                occurrences.forEach((occ, i) => {
                    console.log(`     ${i + 1}. ${new Date(occ.timestamp).toLocaleString()} - Session: ${occ.sessionId}`);
                });
                console.log('');
            }
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

checkEventDetails();
