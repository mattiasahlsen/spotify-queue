<template>
  <div>
    <h2>Currently playing</h2>
    <div class="item-container">
      <clip-loader
        v-if="loading"
        class="spacing"
        color="#1cca59"
        :loading="true"
      ></clip-loader>

      <Track
        v-else-if="currentTrack"
        :track="currentTrack"
        :current="true"
      />
      <div v-else class="queue-empty spacing">
        <p>Queue is empty</p>
        <font-awesome-icon
          icon="sync"
          class="clickable-icon sync"
          @click="fetchCurrent"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import Track from './Track'
import { showErr } from '../lib'

export default {
  components: {
    Track,
    ClipLoader
  },
  computed: {
    loading() {
      return this.$store.state.track.loading || this.$store.state.queue.loading
    },
    currentTrack() {
      return this.$store.state.track.currentTrack
    },
    currentlyPlayingData() {
      return this.$store.state.player.currentlyPlaying
    },
    onQueue() {
      return this.$store.getters.onQueue
    },
  },
  methods: {
    fetchCurrent() {
      this.$store.dispatch('fetchCurrent').catch(showErr)
    },
  }
}
</script>

<style lang="scss" scoped>
.queue-empty {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3em;
}
</style>
