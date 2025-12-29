// check-data.js - Check what data exists for a company
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const COMPANY_ID = 'TM-YXL25'; // Your company ID

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const db = mongoose.connection.db;

        // Check profiles
        const profiles = await db.collection('profiles').find({ company_id: COMPANY_ID }).toArray();
        console.log(`📊 Profiles for ${COMPANY_ID}: ${profiles.length}`);
        profiles.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.name} (${profile.email})`);
        });
        console.log('');

        // Check events
        const events = await db.collection('events').find({ company_id: COMPANY_ID }).toArray();
        console.log(`📊 Event documents for ${COMPANY_ID}: ${events.length}`);

        let totalEventCount = 0;
        events.forEach((eventDoc, index) => {
            const eventsInDoc = eventDoc.events ? eventDoc.events.length : 0;
            totalEventCount += eventsInDoc;
            console.log(`  Document ${index + 1}: ${eventsInDoc} events, sessionId: ${eventDoc.sessionId}, userId: ${eventDoc.userId || 'null'}`);
        });
        console.log(`  Total individual events: ${totalEventCount}\n`);

        // Check if there's data without company_id
        const profilesWithoutCompany = await db.collection('profiles').find({ company_id: { $exists: false } }).toArray();
        const eventsWithoutCompany = await db.collection('events').find({ company_id: { $exists: false } }).toArray();

        if (profilesWithoutCompany.length > 0 || eventsWithoutCompany.length > 0) {
            console.log('⚠️  Found data WITHOUT company_id:');
            console.log(`  Profiles: ${profilesWithoutCompany.length}`);
            console.log(`  Events: ${eventsWithoutCompany.length}`);
            console.log('  This old data should be deleted!\n');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

checkData();
