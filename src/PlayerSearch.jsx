import { useState } from 'react';

const SEARCH_URL = '/r2lb-proxy/r2lb.json';
const SQL_QUERY = `select playfab_id, display_name, steam_name, position, elo, most_played_char, country_code, city, latitude, longitude, snapshot_date, email from latest_entries_by_position where "display_name" like :p0 or "steam_name" like :p1 order by position limit 101`;

export default function PlayerSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('sql', SQL_QUERY);
      params.set('p0', `%${term}%`);
      params.set('p1', `%${term}%`);
      const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const rows = results?.rows ?? [];

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Player Search (R2LB)</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-teal-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-500 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {results && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                {results.columns?.map((col) => (
                  <th key={col} className="text-left px-3 py-2 text-gray-400 uppercase tracking-wider">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={results.columns?.length || 1} className="text-center py-8 text-gray-400">
                    No results found
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">
                        {cell ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {rows.length > 0 && (
            <p className="text-gray-400 text-xs mt-2">{rows.length} result{rows.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      )}
    </div>
  );
}
