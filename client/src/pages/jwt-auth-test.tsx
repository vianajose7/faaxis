import { useState, useEffect } from 'react';

export default function JwtAuthTest() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check current authentication status
    fetchAuthStatus();
    
    // Check if user is authenticated with JWT
    fetchCurrentUser();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth-status');
      const data = await response.json();
      setAuthStatus(data);
    } catch (err: any) {
      console.error('Error checking auth status:', err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/jwt/me');
      
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        setError('');
      } else {
        setUserInfo(null);
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setUserInfo(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/jwt/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserInfo(data.user);
        setSuccessMessage('Logged in successfully!');
        
        // Refresh auth status
        fetchAuthStatus();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError('Error during login: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/jwt/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserInfo(data.user);
        setSuccessMessage('Registered and logged in successfully!');
        
        // Refresh auth status
        fetchAuthStatus();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError('Error during registration: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/jwt/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setUserInfo(null);
        setSuccessMessage('Logged out successfully!');
        
        // Refresh auth status
        fetchAuthStatus();
      } else {
        const data = await response.json();
        setError(data.message || 'Logout failed');
      }
    } catch (err: any) {
      setError('Error during logout: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeAuth = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/jwt/auth-bridge', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserInfo(data.user);
        setSuccessMessage('Session authentication bridged to JWT!');
        
        // Refresh auth status
        fetchAuthStatus();
      } else {
        setError(data.message || 'Auth bridge failed');
      }
    } catch (err: any) {
      setError('Error during auth bridge: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">JWT Authentication Test</h1>
      
      {/* Authentication Status */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50 text-gray-800">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        {authStatus ? (
          <div className="space-y-2">
            <p><strong>JWT Cookie Present:</strong> {authStatus.jwtAuthCookiePresent ? 'Yes' : 'No'}</p>
            <p><strong>Session Authenticated:</strong> {authStatus.sessionAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p>Loading auth status...</p>
        )}
      </div>
      
      {/* User Info */}
      {userInfo ? (
        <div className="mb-8 p-4 border rounded-lg bg-green-50 text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Authenticated User</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {userInfo.id}</p>
            <p><strong>Username:</strong> {userInfo.username}</p>
            <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
            <p><strong>Premium User:</strong> {userInfo.isPremium ? 'Yes' : 'No'}</p>
            <p><strong>Admin:</strong> {userInfo.isAdmin ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Login Form */}
          <div className="p-4 border rounded-lg text-gray-800">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block mb-1">Email/Username</label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block mb-1">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
          
          {/* Register Form */}
          <div className="p-4 border rounded-lg text-gray-800">
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block mb-1">Email/Username</label>
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block mb-1">Password</label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-firstName" className="block mb-1">First Name</label>
                <input
                  id="register-firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-lastName" className="block mb-1">Last Name</label>
                <input
                  id="register-lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Bridge Authentication */}
      <div className="mb-8 p-4 border rounded-lg bg-yellow-50 text-gray-800">
        <h2 className="text-xl font-semibold mb-2">Authentication Bridge</h2>
        <p className="mb-4">
          If you are authenticated with the old session-based system, click below to bridge your 
          authentication to the new JWT-based system.
        </p>
        <button
          onClick={handleBridgeAuth}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Bridging...' : 'Bridge Session Auth to JWT'}
        </button>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 border rounded-lg bg-red-50 text-red-600">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-4 border rounded-lg bg-green-50 text-green-600">
          {successMessage}
        </div>
      )}
    </div>
  );
}