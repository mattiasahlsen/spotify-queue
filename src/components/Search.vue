<template>
  <div>
    <form @submit.prevent="search" class="search-container spacing-y">
      <div class="search-bar-container spacing-right">
        <input
          type="search"
          placeholder="Search tracks..."
          v-model="searchString"
          class="search-bar"
        >
        <div
          v-if="searchString.length > 0"
          class="clear"
        >
          <font-awesome-icon
            class="clear-icon clickable-icon"
            icon="times"
            size="2x"
            @click.prevent="searchString = ''"
          />
        </div>
      </div>
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
.search-container {
  display: flex;
  align-items: stretch;
}
.search-bar-container {
  position: relative;
  display: flex;
  align-items: stretch;
  border-radius: 1px;
  flex: 1 0 0;
  min-width: 0;
}
.search-bar-container {
  display: flex;
  flex: 1 0 0;
}
.search-bar {
  border: none;
  padding: 0;
  font-size: 1.5em;
  background: $light-1;
  color: $dark-1;
  min-width: 0;
  flex: 1 0 0;
  border-radius: 0;
  padding: 0.1em;
  -webkit-appearance: none;
}

.clear {
  color: $dark-1;
  background: $light-1;
  display: flex;
  align-items: center;
}
.clear-icon {
  margin: 0 0.1em;
}
</style>
