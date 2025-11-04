import React, { useState, useEffect } from 'react';
import { Plus, X, Lock } from 'lucide-react';

export default function StreamBlog() {
  const [entries, setEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const [password, setPassword] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    loadEntries();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const auth = await window.storage.get('author-auth');
      if (auth) {
        const authData = JSON.parse(auth.value);
        const sessionAuth = sessionStorage.getItem('stream-auth');
        if (sessionAuth === authData.password) {
          setIsAuthor(true);
        }
      }
    } catch (error) {
      console.log('No auth set');
    }
  };

  const handleAuth = async () => {
    try {
      const auth = await window.storage.get('author-auth');
      if (!auth) {
        await window.storage.set('author-auth', JSON.stringify({ password }));
        sessionStorage.setItem('stream-auth', password);
        setIsAuthor(true);
        setShowAuth(false);
        setPassword('');
      } else {
        const authData = JSON.parse(auth.value);
        if (authData.password === password) {
          sessionStorage.setItem('stream-auth', password);
          setIsAuthor(true);
          setShowAuth(false);
          setPassword('');
        } else {
          alert('Incorrect password');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const result = await window.storage.list('entry:');
      if (result && result.keys) {
        const loadedEntries = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch {
              return null;
            }
          })
        );
        const validEntries = loadedEntries.filter(e => e !== null);
        validEntries.sort((a, b) => b.number - a.number);
        setEntries(validEntries);
      }
    } catch (error) {
      console.log('No entries yet');
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.trim()) return;
    
    const number = entries.length > 0 ? entries[0].number + 1 : 1;
    const timestamp = new Date().toISOString();
    const entry = {
      id: `entry-${Date.now()}`,
      text: newEntry.trim(),
      number,
      timestamp
    };

    try {
      await window.storage.set(`entry:${entry.id}`, JSON.stringify(entry));
      setEntries([entry, ...entries]);
      setNewEntry('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const deleteEntry = async (entry) => {
    try {
      await window.storage.delete(`entry:${entry.id}`);
      setEntries(entries.filter(e => e.id !== entry.id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().replace(/\.\d{3}Z$/, '-0400');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm" style={{ fontFamily: 'Courier New, monospace' }}>
          Loading, please wait one moment...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Courier New, monospace' }}>
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-12 flex items-start justify-between">
          <div className="text-sm leading-relaxed">
            <div className="mb-1">{formatTimestamp(new Date().toISOString())}</div>
          </div>
          <div className="flex gap-3 items-center">
            {!isAuthor && (
              <button
                onClick={() => setShowAuth(!showAuth)}
                className="text-gray-400 hover:text-black transition-colors"
                title="Author login"
              >
                <Lock size={18} />
              </button>
            )}
            {isAuthor && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                {isAdding ? <X size={18} /> : <Plus size={18} />}
              </button>
            )}
          </div>
        </div>

        {showAuth && !isAuthor && (
          <div className="mb-12 border border-gray-300 p-6">
            <div className="text-sm mb-4">Enter password to write:</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full bg-transparent outline-none border-b border-gray-300 pb-2 mb-4 text-sm"
              style={{ fontFamily: 'Courier New, monospace' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAuth();
                }
              }}
            />
            <div className="flex gap-3 text-sm">
              <button
                onClick={handleAuth}
                className="px-4 py-1 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                enter
              </button>
              <button
                onClick={() => {
                  setShowAuth(false);
                  setPassword('');
                }}
                className="px-4 py-1 text-gray-600 hover:text-black transition-colors"
              >
                cancel
              </button>
            </div>
          </div>
        )}

        {isAdding && isAuthor && (
          <div className="mb-12 flex justify-center">
            <div className="w-full max-w-2xl border border-gray-300 p-6">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="write your thought..."
                className="w-full bg-transparent outline-none resize-none text-sm mb-4"
                style={{ fontFamily: 'Courier New, monospace' }}
                rows={3}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    addEntry();
                  }
                }}
              />
              <div className="flex gap-3 text-sm">
                <button
                  onClick={addEntry}
                  className="px-4 py-1 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  save
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewEntry('');
                  }}
                  className="px-4 py-1 text-gray-600 hover:text-black transition-colors"
                >
                  cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-0">
          {entries.length === 0 ? (
            <div className="text-gray-500 text-sm py-20 text-center">
              no entries yet
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="group hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start text-sm leading-relaxed py-1">
                  <div className="w-64 flex-shrink-0 pr-8 text-left">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                  <div className="flex-1 text-center pr-8 whitespace-pre-wrap font-bold">
                    {entry.text}
                  </div>
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span>•</span>
                      <span>{entry.number}</span>
                    </span>
                  </div>
                  {isAuthor && (
                    <button
                      onClick={() => deleteEntry(entry)}
                      className="ml-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs w-6"
                    >
                      ×
                    </button>
                  )}
                </div>
                {index < entries.length - 1 && (
                  <div className="border-b border-gray-200 my-1"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
