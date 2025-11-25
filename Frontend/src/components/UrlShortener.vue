<template>
  <div class="card">
    <div class="form-group">
      <label for="url-input">Enter your long URL</label>
      <div class="input-group">
        <input
          id="url-input"
          v-model="url"
          type="text"
          placeholder="https://example.com/very-long-url..."
          @keyup.enter="shortenUrl"
          :disabled="loading"
        />
        <button 
          @click="shortenUrl" 
          :disabled="loading || !url.trim()"
          class="btn-primary"
        >
          {{ loading ? 'Shortening...' : 'Shorten' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-if="shortUrl" class="alert alert-success">
      <div class="success-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>URL shortened successfully!</span>
      </div>
      <div class="result-group">
        <input
          v-model="shortUrl"
          type="text"
          readonly
          class="result-input"
        />
        <button @click="copyToClipboard" class="btn-copy">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <a :href="shortUrl" target="_blank" rel="noopener noreferrer" class="btn-visit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Visit
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { shortenUrl } from '../services/api'
import { validateUrl } from '../utils/validators'

export default {
  name: 'UrlShortener',
  data() {
    return {
      url: '',
      shortUrl: '',
      loading: false,
      error: '',
      copied: false
    }
  },
  methods: {
    async shortenUrl() {
      this.error = ''
      this.shortUrl = ''

      if (!this.url.trim()) {
        this.error = 'Please enter a URL'
        return
      }

      if (!validateUrl(this.url)) {
        this.error = 'Please enter a valid URL (include http:// or https://)'
        return
      }

      this.loading = true

      try {
        const data = await shortenUrl(this.url)
        this.shortUrl = data.shortUrl
        
        this.$emit('url-shortened', {
          original: this.url,
          short: data.shortUrl,
          code: data.code
        })
        
        this.url = ''
      } catch (err) {
        this.error = err.message || 'Failed to shorten URL'
      } finally {
        this.loading = false
      }
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.shortUrl)
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

input[type="text"] {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
}

input[type="text"]:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  flex-direction: column;
}

.success-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.result-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.75rem;
}

.result-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #166534;
}

.btn-copy,
.btn-visit {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
  border: none;
}

.btn-copy {
  background: #16a34a;
  color: white;
}

.btn-copy:hover {
  background: #15803d;
}

.btn-visit {
  background: white;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-visit:hover {
  background: #f0fdf4;
}
</style>