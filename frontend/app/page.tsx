'use client';

import StatusDisplay from '@/components/response/StatusDisplay';
import { useState } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  executionTime: number;
}

export default function Home() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('http://localhost:8080/api/users');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  const handleSend = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const executionTime = Date.now() - startTime;
      const body = await res.text();

      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        executionTime,
      });
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🚀</span>
          Mini Postman
        </h1>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Request 영역 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Method + URL + Send */}
          <div className="p-6">
            <div className="flex gap-3">
              {/* Method Selector */}
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className={`border-2 rounded-lg px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  method === 'GET' ? 'text-green-600 border-green-300 bg-green-50' :
                  method === 'POST' ? 'text-yellow-600 border-yellow-300 bg-yellow-50' :
                  method === 'PUT' ? 'text-blue-600 border-blue-300 bg-blue-50' :
                  'text-red-600 border-red-300 bg-red-50'
                }`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* URL Input */}
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter request URL"
                className="flex-1 border-2 text-gray-400 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send'}
              </button>
            </div>

            {/* Body (POST, PUT일 때만) */}
            {(method === 'POST' || method === 'PUT') && (
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Request Body
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"name": "홍길동", "email": "hong@test.com"}'
                  className="w-full border-2 text-gray-500 border-gray-300 rounded-lg p-4 font-mono text-sm h-40 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Response 영역 */}
        {response && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Response</h2>
                <StatusDisplay 
                  status={response.status} 
                  executionTime={response.executionTime} 
                />
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('body')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'body'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Body
                  </button>
                  <button
                    onClick={() => setActiveTab('headers')}
                    className={`pb-2 px-1 font-semibold transition-colors ${
                      activeTab === 'headers'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Headers ({Object.keys(response.headers).length})
                  </button>
                </div>
              </div>

              {/* Body Tab */}
              {activeTab === 'body' && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-green-400 text-sm font-mono">
                    {response.body ? 
                      JSON.stringify(JSON.parse(response.body), null, 2) : 
                      '(Empty)'
                    }
                  </pre>
                </div>
              )}

              {/* Headers Tab */}
              {activeTab === 'headers' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-4 text-sm">
                        <span className="font-bold text-gray-700 min-w-[200px]">{key}:</span>
                        <span className="text-gray-600 flex-1 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📡</div>
            <p className="text-gray-500 text-lg">
              Enter a URL and click Send to get a response
            </p>
          </div>
        )}
      </div>
    </div>
  );
}