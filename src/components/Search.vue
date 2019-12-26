<template>
  <div>
    <form @submit.prevent="search" class="search-container spacing-y">
      <input
        placeholder="Search tracks..."
        v-model="searchString"
        class="search-bar spacing-right"
      >
      <button
        class="btn btn-standard search-button"
        type="submit"
      >Search</button>
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
</style>
