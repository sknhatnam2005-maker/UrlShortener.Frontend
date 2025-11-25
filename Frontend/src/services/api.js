import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5293'

console.log('API Base URL:', API_BASE_URL)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  error => {
    console.error('Response Error:', error.response || error)
    if (error.response) {
      // Check if backend returns error in "error" field
      const errorMsg = error.response.data.error || error.response.data.message || 'Server error occurred'
      throw new Error(errorMsg)
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please check if the API is running.')
    } else {
      throw new Error('Request failed. Please try again.')
    }
  }
)

// API Methods
export const shortenUrl = async (originalUrl) => {
  const response = await apiClient.post('/api/Url/shorten', { 
    url: originalUrl
  })
  
  // Check if success
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to shorten URL')
  }
  
  // Extract code from shortUrl (e.g., "http://localhost:5000/tf73lk" -> "tf73lk")
  const shortUrl = response.data.shortUrl
  const code = shortUrl.split('/').pop()
  
  return {
    shortUrl: shortUrl,
    code: code,
    originalUrl: response.data.originalUrl
  }
}

export const getUrlByCode = async (code) => {
  const response = await apiClient.get(`/${code}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'URL not found')
  }
  
  return {
    code: code,
    originalUrl: response.data.originalUrl,
    shortUrl: response.data.shortUrl,
    clicks: response.data.clicks || 0,
    createdAt: response.data.createdAt
  }
}

export const getAllUrls = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/api/Url/list', {
    params: { 
      page: page, 
      pageSize: limit 
    }
  })
  
  // Check backend response structure
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch URLs')
  }
  
  // Map backend data to frontend format
  const urls = (response.data.urls || response.data.items || []).map(url => {
    const code = url.shortUrl ? url.shortUrl.split('/').pop() : url.code
    return {
      code: code,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks || 0,
      createdAt: url.createdAt
    }
  })
  
  return {
    urls: urls,
    totalPages: response.data.totalPages || 1,
    currentPage: response.data.currentPage || page,
    totalCount: response.data.totalCount || urls.length
  }
}

export const deleteUrl = async (code) => {
  const response = await apiClient.delete(`/api/Url/${code}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete URL')
  }
  
  return response.data
}

export const getUrlStats = async (code) => {
  const response = await apiClient.get(`/${code}`)
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'URL not found')
  }
  
  return {
    code: code,
    originalUrl: response.data.originalUrl,
    shortUrl: response.data.shortUrl,
    clicks: response.data.clicks || 0,
    createdAt: response.data.createdAt
  }
}

export default apiClient