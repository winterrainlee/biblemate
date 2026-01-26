
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

async function checkVersions() {
    const SQL = await initSqlJs();
    const dbPath = './server/data/bible.db';
    const data = fs.readFileSync(dbPath);
    const db = new SQL.Database(data);

    const res = db.exec("SELECT DISTINCT version FROM bible_verses");
    console.log(JSON.stringify(res[0].values.map(v => v[0])));
}

checkVersions();
