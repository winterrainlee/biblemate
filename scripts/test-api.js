/**
 * API Test Script
 * Verifies core API functionality
 */

import http from 'http';

const BASE_URL = 'http://localhost:3001/api';

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting API Tests...\n');

    try {
        // 1. Health Check
        console.log('1. Health Check');
        const health = await request('GET', '/health');
        console.log(health.status === 200 ? '✅ OK' : '❌ Failed', health.data);

        // 2. Get Books
        console.log('\n2. Get Books (Deprecated /api/bible/books list)');
        // Note: The previous test might have assumed a different endpoint or logic.
        // Let's test the NEW endpoint specifically to ensure chapter counts are returned.
        const books = await request('GET', '/bible/books');
        console.log(books.data.length === 66 ? '✅ OK (66 books)' : '❌ Failed', `Count: ${books.data.length}`);
        if (books.data.length > 0) {
            console.log(`   Sample: ${books.data[0].name} (${books.data[0].chapters} chapters)`);
        }

        // 3. Get Chapter (Gen 1) - KRV
        console.log('\n3. Get Chapter (Gen 1) - KRV');
        const chapter = await request('GET', '/bible/Gen/1');
        console.log(chapter.data.verses.length > 0 ? '✅ OK' : '❌ Failed', `Verses: ${chapter.data.verses.length}`);

        // 3.1 Get Chapter (Gen 1) - BBE
        console.log('\n3.1 Get Chapter (Gen 1) - BBE');
        const bbe = await request('GET', '/bible/Gen/1?version=bbe');
        console.log(bbe.data.verses.length > 0 ? '✅ OK' : '❌ Failed', `Verses: ${bbe.data.verses ? bbe.data.verses.length : 0}`);

        // 4. Add Highlight
        console.log('\n4. Add Highlight');
        const hlRes = await request('POST', '/highlights', {
            book: 'Gen', chapter: 1, verse: 1, style: '#ffeb3b'
        });
        console.log(hlRes.status === 200 ? '✅ OK' : '❌ Failed', hlRes.data);

        // 5. Get Highlights
        console.log('\n5. Get Highlights');
        const highlights = await request('GET', '/highlights');
        console.log(highlights.data.length > 0 ? '✅ OK' : '❌ Failed', `Count: ${highlights.data.length}`);

        // 6. Add Note
        console.log('\n6. Add Note');
        const noteRes = await request('POST', '/notes', {
            date: '2026-01-04', content: 'Test meditation note'
        });
        console.log(noteRes.status === 200 ? '✅ OK' : '❌ Failed', noteRes.data);

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Wait for server to start if running immediately after start
setTimeout(runTests, 2000);
