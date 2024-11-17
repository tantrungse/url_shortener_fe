import React, { useState } from 'react';
import { Copy, ArrowRight, ExternalLink } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const URLShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [decodedUrl, setDecodedUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('encode'); // 'encode' or 'decode'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOriginalUrl(''); // Clear input field
    setShortenedUrl(''); // Clear results
    setDecodedUrl('');
    setError('');
    setCopied(false);
  };

  const handleEncode = async (e) => {
    e.preventDefault();
    setError('');
    setShortenedUrl('');
    setDecodedUrl('');
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/encode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_url: originalUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShortenedUrl(data.short_url);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async (e) => {
    e.preventDefault();
    setError('');
    setDecodedUrl('');
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/decode?short_url=${encodeURIComponent(originalUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDecodedUrl(data.original_url);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
        <p className="text-gray-600 mb-4">Shorten or decode URLs</p>
        
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => handleTabChange('encode')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Shorten URL
          </button>
          <button
            onClick={() => handleTabChange('decode')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Decode URL
          </button>
        </div>
      </div>

      <form onSubmit={activeTab === 'encode' ? handleEncode : handleDecode} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder={activeTab === 'encode' ? "Enter long URL to shorten" : "Enter shortened URL to decode"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : activeTab === 'encode' ? 'Shorten URL' : 'Decode URL'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {(shortenedUrl || decodedUrl) && (
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeTab === 'encode' ? shortenedUrl : decodedUrl}
              readOnly
              className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded"
            />
            <button
              onClick={() => handleCopy(activeTab === 'encode' ? shortenedUrl : decodedUrl)}
              className="p-2 text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLShortener;