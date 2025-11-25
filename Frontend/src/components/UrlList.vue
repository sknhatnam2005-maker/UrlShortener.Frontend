<template>
  <div class="card">
    <div class="list-header">
      <h2>All Shortened URLs</h2>
      <button @click="loadUrls" class="btn-refresh" :disabled="loading">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          :class="{ 'spin': loading }"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Refresh
      </button>
    </div>

    <div v-if="loading && urls.length === 0" class="loading">
      <div class="spinner"></div>
      <p>Loading URLs...</p>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="urls.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>No URLs found</p>
      <span>Create your first shortened URL above</span>
    </div>

    <div v-else class="urls-table">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Short Code</th>
              <th>Original URL</th>
              <th>Short URL</th>
              <th>Clicks</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="url in urls" :key="url.code">
              <td>
                <code class="code-badge">{{ url.code }}</code>
              </td>
              <td>
                <div class="url-cell">
                  <a :href="url.originalUrl" target="_blank" rel="noopener noreferrer" class="url-link">
                    {{ truncateUrl(url.originalUrl, 50) }}
                  </a>
                </div>
              </td>
              <td>
                <div class="short-url-cell">
                  <span class="short-url">{{ url.shortUrl }}</span>
                  <button @click="copyToClipboard(url.shortUrl)" class="btn-icon-small" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </td>
              <td>
                <span class="clicks-badge">{{ url.clicks || 0 }}</span>
              </td>
              <td>
                <span class="date-text">{{ formatDate(url.createdAt) }}</span>
              </td>
              <td>
                <div class="actions-cell">
                  <button @click="viewStats(url.code)" class="btn-action btn-stats" title="View Stats">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                  </button>
                  <a :href="url.shortUrl" target="_blank" class="btn-action btn-visit" title="Visit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                  <button 
                    @click="confirmDelete(url.code)" 
                    class="btn-action btn-delete" 
                    title="Delete"
                    :disabled="deletingCode === url.code"
                  >
                    <svg v-if="deletingCode !== url.code" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <div v-else class="spinner-small"></div>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="cancelDelete" class="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this shortened URL?</p>
          <code class="code-badge">{{ codeToDelete }}</code>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-secondary">Cancel</button>
          <button @click="deleteUrlConfirmed" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click="closeStats">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h3>URL Statistics</h3>
          <button @click="closeStats" class="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loadingStats" class="loading">
            <div class="spinner"></div>
            <p>Loading statistics...</p>
          </div>
          <div v-else-if="stats">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Total Clicks</span>
                  <span class="stat-value">{{ stats.clicks }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Created</span>
                  <span class="stat-value">{{ formatDate(stats.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="stats-details">
              <div class="detail-row">
                <span class="detail-label">Short Code:</span>
                <code class="code-badge">{{ stats.code }}</code>
              </div>
              <div class="detail-row">
                <span class="detail-label">Short URL:</span>
                <a :href="stats.shortUrl" target="_blank" class="detail-link">{{ stats.shortUrl }}</a>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original URL:</span>
                <a :href="stats.originalUrl" target="_blank" class="detail-link">{{ stats.originalUrl }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllUrls, deleteUrl, getUrlStats } from '../services/api'

export default {
  name: 'UrlList',
  data() {
    return {
      urls: [],
      loading: false,
      error: '',
      currentPage: 1,
      totalPages: 1,
      limit: 10,
      showDeleteModal: false,
      codeToDelete: null,
      deletingCode: null,
      showStatsModal: false,
      stats: null,
      loadingStats: false
    }
  },
  methods: {
    async loadUrls() {
      this.loading = true
      this.error = ''

      try {
        const data = await getAllUrls(this.currentPage, this.limit)
        this.urls = data.urls
        this.totalPages = data.totalPages
        this.currentPage = data.currentPage
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        await this.loadUrls()
      }
    },
    confirmDelete(code) {
      this.codeToDelete = code
      this.showDeleteModal = true
    },
    cancelDelete() {
      this.showDeleteModal = false
      this.codeToDelete = null
    },
    async deleteUrlConfirmed() {
      if (!this.codeToDelete) return

      this.deletingCode = this.codeToDelete
      this.showDeleteModal = false

      try {
        await deleteUrl(this.codeToDelete)
        this.urls = this.urls.filter(url => url.code !== this.codeToDelete)
        this.$emit('url-deleted', this.codeToDelete)
        
        if (this.urls.length === 0 && this.currentPage > 1) {
          this.currentPage--
          await this.loadUrls()
        }
      } catch (err) {
        this.error = err.message
      } finally {
        this.deletingCode = null
        this.codeToDelete = null
      }
    },
    async viewStats(code) {
      this.showStatsModal = true
      this.loadingStats = true
      this.stats = null

      try {
        this.stats = await getUrlStats(code)
      } catch (err) {
        this.error = err.message
        this.showStatsModal = false
      } finally {
        this.loadingStats = false
      }
    },
    closeStats() {
      this.showStatsModal = false
      this.stats = null
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
      // You can add a toast notification here
    },
    truncateUrl(url, maxLength) {
      if (url.length <= maxLength) return url
      return url.substring(0, maxLength) + '...'
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  mounted() {
    this.loadUrls()
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #5568d3;
}

.btn-refresh:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state span {
  font-size: 0.875rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

tr:hover {
  background: #f9fafb;
}

.code-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
}

.url-cell {
  max-width: 300px;
}

.url-link {
  color: #374151;
  text-decoration: none;
  word-break: break-all;
}

.url-link:hover {
  color: #667eea;
  text-decoration: underline;
}

.short-url-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.short-url {
  font-family: 'Courier New', monospace;
  color: #667eea;
  font-size: 0.875rem;
}

.btn-icon-small {
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-icon-small:hover {
  background: #f3f4f6;
  color: #667eea;
}

.clicks-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.25rem 0.5rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
}

.date-text {
  color: #6b7280;
  font-size: 0.8125rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-stats {
  color: #2563eb;
}

.btn-stats:hover {
  background: #eff6ff;
}

.btn-visit {
  color: #059669;
  text-decoration: none;
}

.btn-visit:hover {
  background: #f0fdf4;
}

.btn-delete {
  color: #dc2626;
}

.btn-delete:hover:not(:disabled) {
  background: #fef2f2;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-page {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-page:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.btn-close {
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #dc2626;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: #374151;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-danger {
  padding: 0.625rem 1.25rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* Stats Modal */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 8px;
  color: #667eea;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stats-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  min-width: 100px;
  font-size: 0.875rem;
}

.detail-link {
  color: #667eea;
  text-decoration: none;
  word-break: break-all;
  font-size: 0.875rem;
}

.detail-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.5rem;
  }

  .url-cell {
    max-width: 150px;
  }

  .actions-cell {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>