<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <h1>URL Shortener</h1>
        <p>Transform long URLs into short, shareable links</p>
      </header>

      <UrlShortener @url-shortened="handleUrlShortened" />
      
      <RecentUrls :urls="recentUrls" @delete-url="handleDeleteFromRecent" />

      <footer class="footer">
        <p>Built with Vue.js • RESTful API • Docker • CI/CD Pipeline</p>
      </footer>
    </div>
  </div>
</template>

<script>
import UrlShortener from './components/UrlShortener.vue'
import RecentUrls from './components/RecentUrls.vue'

export default {
  name: 'App',
  components: {
    UrlShortener,
    RecentUrls
  },
  data() {
    return {
      recentUrls: []
    }
  },
  methods: {
    handleUrlShortened(urlData) {
      this.recentUrls.unshift({
        ...urlData,
        timestamp: new Date().toISOString()
      })
      if (this.recentUrls.length > 5) {
        this.recentUrls.pop()
      }
      this.saveToLocalStorage()
    },
    handleDeleteFromRecent(code) {
      this.recentUrls = this.recentUrls.filter(url => url.code !== code)
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      localStorage.setItem('recentUrls', JSON.stringify(this.recentUrls))
    },
    loadFromLocalStorage() {
      const stored = localStorage.getItem('recentUrls')
      if (stored) {
        this.recentUrls = JSON.parse(stored)
      }
    }
  },
  mounted() {
    this.loadFromLocalStorage()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.logo {
  display: inline-flex;
  background: white;
  padding: 1rem;
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.logo svg {
  color: #667eea;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.footer {
  text-align: center;
  margin-top: 3rem;
  padding: 1.5rem;
  color: white;
  opacity: 0.8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .container {
    padding: 1rem;
  }
}
</style>