import React, { useState } from 'react';
import api from '../../utils/api';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setResult(`✅ SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`❌ ERROR: ${error.message}\nDetails: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
    setLoading(false);
  };

  const testLoginEndpoint = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'admin@repora.com',
        password: 'admin123'
      });
      setResult(`✅ LOGIN SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`❌ LOGIN ERROR: ${error.message}\nDetails: ${JSON.stringify(error.response?.data || {}, null, 2)}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-dark-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testHealthEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded mr-4"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
        
        <button
          onClick={testLoginEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          {loading ? 'Testing...' : 'Test Login Endpoint'}
        </button>
      </div>

      <div className="bg-dark-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Result:</h3>
        <pre className="text-sm whitespace-pre-wrap">{result || 'Click a button to test the API connection'}</pre>
      </div>

      <div className="mt-6 bg-dark-800 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Environment Info:</h3>
        <p>API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
};

export default ApiTest;