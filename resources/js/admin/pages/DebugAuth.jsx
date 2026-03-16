import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DebugAuth() {
    const { token } = useAuth();
    const [debug, setDebug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testDebugRoute = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://192.168.1.9:8000/api/admin/debug/auth', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('Debug Response:', data);
            setDebug(data);
        } catch (err) {
            console.error('Debug Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-white">
            <h1 className="text-2xl font-bold mb-4">🔍 Debug Authentication</h1>
            
            <div className="mb-4">
                <p className="text-sm text-gray-600">Token en Frontend: <code>{token?.substring(0, 30)}...</code></p>
            </div>

            <button
                onClick={testDebugRoute}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'Testing...' : 'Test Debug Route'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    <p>Error: {error}</p>
                </div>
            )}

            {debug && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <pre className="text-xs overflow-auto">{JSON.stringify(debug, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
