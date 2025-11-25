<template>
  <div v-if="urls.length > 0" class="card">
    <h2>Recent URLs</h2>
    <div class="urls-list">
      <UrlCard
        v-for="(url, index) in urls"
        :key="index"
        :url-data="url"
        @copy="handleCopy"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script>
import UrlCard from './UrlCard.vue'

export default {
  name: 'RecentUrls',
  components: {
    UrlCard
  },
  props: {
    urls: {
      type: Array,
      required: true
    }
  },
  emits: ['delete-url'],
  methods: {
    handleCopy(shortUrl) {
      navigator.clipboard.writeText(shortUrl)
    },
    handleDelete(code) {
      this.$emit('delete-url', code)
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
  margin-top: 2rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.urls-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>