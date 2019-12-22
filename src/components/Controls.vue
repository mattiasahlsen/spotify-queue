<template>
  <div class="controls">
    <font-awesome-icon
      icon="fast-backward"
      :class="[ track ? 'clickable-icon' : 'non-clickable' ]"
      size="2x"
      @click="previous"
    />
    <font-awesome-icon
      v-if="isPlaying"
      class="play"
      :class="[ track ? 'clickable-icon' : 'non-clickable' ]"
      icon="pause-circle"
      size="3x"
      @click="pause"
    />
    <font-awesome-icon
      v-else
      class="play"
      :class="[ track ? 'clickable-icon' : 'non-clickable' ]"
      icon="play-circle"
      size="3x"
      @click="play"
    />
    <font-awesome-icon
      icon="fast-forward"
      :class="[ track ? 'clickable-icon' : 'non-clickable' ]"
      size="2x"
      @click="next"
    />
  </div>
</template>

<script>
import { showErr } from '../lib'

export default {
  computed: {
    isPlaying() {
      return this.$store.getters.isPlaying
    },
    onQueue() {
      return this.$store.getters.onQueue
    },
    track() {
      return this.$store.state.track.currentTrack
    }
  },
  methods: {
    play() {
      this.$store.dispatch('play').catch(showErr)
    },
    pause() {
      this.$store.dispatch('play', { pause: true }).catch(showErr)
    },
    next() {
      this.$store.dispatch('playNext').catch(showErr)
    },
    previous() {
      this.$store.dispatch('playPrevious').catch(showErr)
    },

    showErr,
  }
}
</script>

<style scoped lang="scss">
.controls {
  margin: 0.5em 0.2em;
  display: flex;
  justify-content: center;
  align-items: center;
}
.clickable-icon {
  cursor: pointer;
  &:hover {
    color: $grey-2;
  }
}
.play {
  margin: 0 0.2em;
}
</style>
