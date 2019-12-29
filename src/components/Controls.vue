<template>
  <div class="controls">
    <font-awesome-icon
      icon="fast-backward"
      class="clickable-icon"
      size="3x"
      @click.prevent="previous"
    />
    <font-awesome-icon
      v-if="isPlaying"
      class="play clickable-icon"
      icon="pause-circle"
      size="4x"
      @click.prevent="pause"
    />
    <font-awesome-icon
      v-else
      class="play clickable-icon"
      icon="play-circle"
      size="4x"
      @click.prevent="play"
    />
    <font-awesome-icon
      icon="fast-forward"
      class="clickable-icon"
      size="3x"
      @click.prevent="next"
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
  },
  methods: {
    play() {
      this.$store.dispatch('resume').catch(showErr)
    },
    pause() {
      this.$store.dispatch('pause').catch(showErr)
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
.play {
  margin: 0 0.2em;
}
</style>
