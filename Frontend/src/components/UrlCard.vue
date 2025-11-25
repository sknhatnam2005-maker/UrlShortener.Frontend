<template>
  <div class="url-card">
    <div class="url-content">
      <div class="url-section">
        <span class="label">Original URL</span>
        <p class="url-text original">{{ urlData.original }}</p>
      </div>
      <div class="url-section">
        <span class="label">Short URL</span>
        <p class="url-text short">{{ urlData.short }}</p>
      </div>
    </div>
    <div class="url-actions">
      <button @click="$emit('copy', urlData.short)" class="btn-icon" title="Copy">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <a :href="urlData.short" target="_blank" class="btn-icon" title="Visit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
      <button @click="confirmDelete" class="btn-icon btn-delete" title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
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
          <p>Are you sure you want to remove this URL from recent list?</p>
          <div class="url-preview">
            <strong>Short URL:</strong>
            <code>{{ urlData.short }}</code>
          </div>
          <p class="warning-text">This will only remove it from your recent list.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-secondary">Cancel</button>
          <button @click="handleDelete" class="btn-danger">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrlCard',
  props: {
    urlData: {
      type: Object,
      required: true
    }
  },
  emits: ['copy', 'delete'],
  data() {
    return {
      showDeleteModal: false
    }
  },
  methods: {
    confirmDelete() {
      this.showDeleteModal = true
    },
    cancelDelete() {
      this.showDeleteModal = false
    },
    handleDelete() {
      this.$emit('delete', this.urlData.code)
      this.showDeleteModal = false
    }
  }
}
</script>

<style scoped>
.url-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.url-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.url-content {
  flex: 1;
  min-width: 0;
}

.url-section {
  margin-bottom: 0.75rem;
}

.url-section:last-child {
  margin-bottom: 0;
}

.label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.url-text {
  font-size: 0.875rem;
  word-break: break-all;
}

.url-text.original {
  color: #374151;
}

.url-text.short {
  color: #667eea;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.url-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #667eea;
}

.btn-icon.btn-delete:hover {
  background: #fef2f2;
  color: #dc2626;
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

.url-preview {
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin: 1rem 0;
}

.url-preview strong {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.url-preview code {
  font-family: 'Courier New', monospace;
  color: #667eea;
  word-break: break-all;
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

@media (max-width: 768px) {
  .url-actions {
    flex-direction: column;
  }

  .modal {
    margin: 1rem;
  }
}
</style>
```

