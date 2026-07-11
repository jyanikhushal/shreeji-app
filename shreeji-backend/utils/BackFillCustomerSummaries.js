// ── ONE-TIME BACKFILL SCRIPT ──
// Populates currentBalance + lastDepositAt on every existing customer doc
// by recomputing from their entries subcollection.
//
// Run once manually on your feature branch before testing:
//   node backfillCustomerSummaries.js
//
// Safe to re-run — it's idempotent (just recomputes the same values again).

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { db } = require('../firebase');
const { recomputeCustomerSummary } = require('./customerSummary');

async function backfillAllCustomers() {
    console.log('Starting backfill...');

    const maliksSnap = await db.collection('maliks').get();

    let totalCustomers = 0;
    let successCount = 0;
    let failCount = 0;

    for (const malikDoc of maliksSnap.docs) {
        const malikPhone = malikDoc.id;

        const customersSnap = await db
            .collection('maliks')
            .doc(malikPhone)
            .collection('customers')
            .get();

        console.log(`Malik ${malikPhone}: ${customersSnap.docs.length} customers found`);

        for (const customerDoc of customersSnap.docs) {
            const customerPhone = customerDoc.id;
            totalCustomers++;

            try {
                await recomputeCustomerSummary(malikPhone, customerPhone);
                successCount++;
                console.log(`  ✅ ${customerPhone} updated`);
            } catch (err) {
                failCount++;
                console.error(`  ❌ ${customerPhone} failed:`, err.message);
            }
        }
    }

    console.log('\n── Backfill complete ──');
    console.log(`Total customers processed: ${totalCustomers}`);
    console.log(`Succeeded: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

backfillAllCustomers()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Backfill script crashed:', err);
        process.exit(1);
    });