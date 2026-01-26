// import fetch from 'node-fetch'; // Native fetch used in Node 18+

const BASE_URL = 'http://localhost:3001/api';

async function verifyBackup() {
    console.log('🔄 Starting Backup Export Verification...');
    try {
        const res = await fetch(`${BASE_URL}/backup/export`);
        if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

        const json = await res.json();
        console.log(`✅ Export successful. App Version: ${json.app_version}, Schema: ${json.schema_version}`);

        const { data } = json;
        console.log('📦 Data Structure Check:');

        const checks = [
            { key: 'verse_notes', label: 'Verse Notes' },
            { key: 'free_notes', label: 'Free Notes' },
            { key: 'daily_prayers', label: 'Prayers' },
            { key: 'reading_logs', label: 'Reading Logs' },
            { key: 'highlights', label: 'Highlights' }
        ];

        let allPass = true;
        checks.forEach(check => {
            if (Array.isArray(data[check.key])) {
                console.log(`   [PASS] ${check.label}: Found ${data[check.key].length} records`);
            } else {
                console.error(`   [FAIL] ${check.label}: Missing or invalid type`);
                allPass = false;
            }
        });

        if (allPass) {
            console.log('✨ All checks passed!');
        } else {
            console.error('❌ Some checks failed.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyBackup();
