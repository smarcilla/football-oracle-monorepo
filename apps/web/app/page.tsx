'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const analyzeMatch = async () => {
    setLoading(true);
    setStatus('Starting analysis...');

    try {
      const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/analyze/test-match-123`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to start analysis');

      setStatus(`Analysis started! Check service logs for the complete flow.`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    void analyzeMatch();
  };

  return (
    <main>
      <h1>Football Oracle</h1>
      <p>Walking Skeleton - Event Flow Test</p>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Match'}
        </button>
      </div>

      {status && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}
        >
          <strong>Status:</strong> {status}
        </div>
      )}

      <div style={{ marginTop: '2rem', color: '#666' }}>
        <h3>Expected Flow:</h3>
        <ol>
          <li>Frontend → POST /analyze → API</li>
          <li>API → match.analysis_requested → Scraper</li>
          <li>Scraper → match.data_extracted → Engine</li>
          <li>Engine → match.simulation_completed → Journalist</li>
          <li>Journalist → match.report_ready → API</li>
        </ol>
      </div>
    </main>
  );
}
