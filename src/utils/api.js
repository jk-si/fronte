const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get default headers for API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Headers object
 */
const getDefaultHeaders = (additionalHeaders = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = getDefaultHeaders(options.headers);

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
};

/**
 * GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 */
const get = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
};

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
const post = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
const put = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
};

/**
 * PATCH request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
const patch = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
};

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} Response data
 */
const del = async (endpoint) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};

export {
  API_BASE,
  getAuthToken,
  isAuthenticated,
  getDefaultHeaders,
  apiRequest,
  get,
  post,
  put,
  patch,
  del
};
