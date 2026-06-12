const API_BASE_URL = '/api';

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
            const error = new Error(errorData.error || `API Error: ${response.status}`);
            error.status = response.status;
            throw error;
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
    getNotes: () => request('GET', '/free-notes'),
    getNote: async (date) => {
        try {
            return await request('GET', `/free-notes/${date}`);
        } catch (error) {
            if (error.status === 404) return null;
            throw error;
        }
    },
    saveNote: (data) => request('POST', '/free-notes', data), // upsert by date { date, content }
    addNote: (data) => request('POST', '/free-notes', data), // alias for saveNote
    updateNote: (_id, data) => request('POST', '/free-notes', data),
    deleteNote: (date) => request('DELETE', `/free-notes/${date}`),

    // Reading Logs
    getReadingLogs: () => request('GET', '/reading-logs'),
    addReadingLog: (data) => request('POST', '/reading-logs', data), // { date, book, chapter, verses_count }
    removeReadingLog: (id) => request('DELETE', `/reading-logs/${id}`),

    // Health
    checkHealth: () => request('GET', '/health'),

    // Settings
    getSettings: () => request('GET', '/settings'),
    saveSetting: (key, value) => request('POST', '/settings', { key, value }),
};
