<template>
  <div>
    <form @submit.prevent="search" class="search-container spacing-y">
      <input
        type="search"
        placeholder="Search tracks..."
        v-model="searchString"
        class="search-bar spacing-right"
      >
      <div class="search-buttons">
        <button
          class="btn btn-standard search-button spacing-bottom"
          type="submit"
        >Search</button>
        <button
          v-if="searchString.length > 0"
          class="btn btn-standard"
          @click="searchString = ''"
        >
          Clear
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { showErr } from '../lib'

export default {
  data() {
    return {
      searchString: '',
    }
  },
  methods: {
    search() {
      if (this.searchString) {
        this.$store.dispatch('searchTracks', this.searchString)
          .catch(showErr)
      }
    },
  }
}
</script>

<style scoped lang="scss">
.search-buttons {
  display: flex;
  flex-direction: column;
}
</style>
