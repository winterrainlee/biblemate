const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Generic API request handler
 */
async function request(method, endpoint, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Request Failed (${endpoint}):`, error);
        throw error;
    }
}

export const api = {
    // Bible
    getBooks: () => request('GET', '/bible/books'),
    getChapter: (book, chapter, version = 'krv') => request('GET', `/bible/${book}/${chapter}?version=${version}`),
    searchVerses: (q, version = 'krv') => request('GET', `/bible/search?q=${encodeURIComponent(q)}&version=${version}`),

    // Highlights
    getHighlights: () => request('GET', '/highlights'),
    addHighlight: (data) => request('POST', '/highlights', data), // { book, chapter, verse, style }
    removeHighlight: (id) => request('DELETE', `/highlights/${id}`),

    // Notes
    getNotes: () => request('GET', '/notes'),
    getNote: (date) => request('GET', `/notes/${date}`),
    saveNote: (data) => request('POST', '/notes', data), // upsert by date { date, content }
    addNote: (data) => request('POST', '/notes', data), // alias for saveNote
    updateNote: (id, data) => request('PUT', `/notes/${id}`, data),
    deleteNote: (date) => request('DELETE', `/notes/by-date/${date}`),

    // Reading Logs
    getReadingLogs: () => request('GET', '/reading-logs'),
    addReadingLog: (data) => request('POST', '/reading-logs', data), // { date, book, chapter, verses_count }
    removeReadingLog: (id) => request('DELETE', `/reading-logs/${id}`),

    // Health
    checkHealth: () => request('GET', '/health'),
};
