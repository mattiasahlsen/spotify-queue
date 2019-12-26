<template>
  <div>
    <clip-loader
      v-if="loadingTracks"
      class="spacing"
      color="#1cca59"
      :loading="true"
    ></clip-loader>

    <div v-if="tracks">
      <div v-for="track in tracks" :key="track.id" class="item-container">
        <Track :track="track"/>
        <button
          class="btn btn-standard spacing right"
          :disabled="addedTracks.includes(track)"
          @click="() => addTrack(track)"
        >{{addedTracks.includes(track) ? 'Added' : 'Add to queue'}}</button>
      </div>

      <div class="clear-tracks spacing-y">
        <button
          class="btn btn-standard right"
          @click="clearTracks"
        >Clear</button>
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
    addedTracks() {
      return this.$store.state.queue.addedTracks
    },
    loadingTracks() {
      return this.$store.state.search.loading
    },
    tracks() {
      return this.$store.state.search.tracks
    },
  },
  methods: {
    addTrack(track) {
      if (!this.addedTracks.includes(track)) {
        this.$store.dispatch('addTrack', track).catch(showErr)
      }
    },
    clearTracks() {
      this.$store.commit('tracks', null)
    },
  }
}
</script>
