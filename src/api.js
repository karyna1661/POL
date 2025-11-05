// API client for blog entries
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5173';

export const api = {
  async getEntries() {
    try {
      const response = await fetch(`${API_BASE}/api/entries`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      return data.entries || [];
    } catch (error) {
      console.error('Get entries error:', error);
      return [];
    }
  },

  async createEntry(entry) {
    try {
      const response = await fetch(`${API_BASE}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      if (!response.ok) throw new Error('Failed to create entry');
      return await response.json();
    } catch (error) {
      console.error('Create entry error:', error);
      throw error;
    }
  },

  async deleteEntry(id) {
    try {
      const response = await fetch(`${API_BASE}/api/entries`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('Failed to delete entry');
      return await response.json();
    } catch (error) {
      console.error('Delete entry error:', error);
      throw error;
    }
  },

  async getAuth() {
    try {
      const response = await fetch(`${API_BASE}/api/auth`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.auth;
    } catch (error) {
      console.error('Get auth error:', error);
      return null;
    }
  },

  async setAuth(password) {
    try {
      const response = await fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!response.ok) throw new Error('Failed to set auth');
      return await response.json();
    } catch (error) {
      console.error('Set auth error:', error);
      throw error;
    }
  }
};
