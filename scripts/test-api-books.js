
import fetch from 'node-fetch';

async function testBooks() {
    try {
        const res = await fetch('http://localhost:3001/api/bible/books');
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data length:', data.length);
        if (data.length > 0) {
            console.log('First book:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No books returned');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testBooks();
