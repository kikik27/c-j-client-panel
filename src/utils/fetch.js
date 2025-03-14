// src/utils/api.js

/**
 * API utilities for making fetch requests
 * Uses the base API URL from environment variables
 */

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
/**
 * Make a fetch request to the API
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {boolean} useAuth - Whether to include the auth token (if available)
 * @returns {Promise} - Promise resolving to the parsed response
 */
export const fetchApi = async (endpoint, options = {}, useAuth = true) => {
  // Build the complete URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Set up default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization token if required and available
  if (useAuth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Merge default options with provided options
  const fetchOptions = {
    method: 'GET',
    headers,
    ...options,
  };

  // Convert request body to JSON string if it's an object
  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
    }

    // Parse the response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Shorthand methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}, useAuth = true) =>
    fetchApi(endpoint, { ...options, method: 'GET' }, useAuth),

  post: (endpoint, data = {}, options = {}, useAuth = true) =>
    fetchApi(endpoint, { ...options, method: 'POST', body: data }, useAuth),

  put: (endpoint, data = {}, options = {}, useAuth = true) =>
    fetchApi(endpoint, { ...options, method: 'PUT', body: data }, useAuth),

  patch: (endpoint, data = {}, options = {}, useAuth = true) =>
    fetchApi(endpoint, { ...options, method: 'PATCH', body: data }, useAuth),

  delete: (endpoint, options = {}, useAuth = true) =>
    fetchApi(endpoint, { ...options, method: 'DELETE' }, useAuth),
};

export default api;