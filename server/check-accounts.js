// check-accounts.js - Check existing accounts
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAccounts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const db = mongoose.connection.db;
        const accounts = await db.collection('accounts').find({}).toArray();

        console.log(`📊 Found ${accounts.length} accounts:\n`);

        accounts.forEach((account, index) => {
            console.log(`Account ${index + 1}:`);
            console.log(`  Name: ${account.firstName} ${account.lastName}`);
            console.log(`  Email: ${account.email}`);
            console.log(`  Company: ${account.company_name}`);
            console.log(`  Company ID: ${account.company_id || 'MISSING!'}`);
            console.log('');
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

checkAccounts();
