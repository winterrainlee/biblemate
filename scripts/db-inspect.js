import { initDB, closeDB } from '../server/db/init.js';

async function inspect(query) {
    const db = await initDB();
    try {
        const result = db.exec(query);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
    closeDB();
}

const q = process.argv[2];
if (q) inspect(q);
