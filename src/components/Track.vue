<template>
  <div>
    <div v-if="current" class="progress" :style="{ right: remaining + '%' }">
    </div>
    <div class="item">
      <div class="item-left">
        <h1>{{track.name}}</h1>
        <h2 v-for="artist in track.artists" :key="artist.id">{{artist.name}}</h2>
        <p class="popularity">Popularity on Spotify: <strong :style="{ color: popularity }">{{track.popularity}}</strong></p>
      </div>
      <div>
        <img v-if="track.album.images && track.album.images.length === 3" :src="track.album.images[2].url">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['track', 'current'],
  data() {
    return {
      updateProgressInterval: null,
    }
  },
  computed: {
    progress() {
      return this.$store.getters.liveProgress
    },
    isPlaying() {
      return this.$store.getters.isPlaying
    },
    remaining() {
      return 100 * (1 - this.progress / this.track.duration_ms)
    },
    popularity() {
      const red = 255 * (1 - this.track.popularity / 100)
      const green = 255 * this.track.popularity / 100
      return `rgb(${red}, ${green}, 0)`
    },
  },
  created() {
    const FPS = 60
    if (this.updateProgressInterval) clearInterval(this.updateProgressInterval)
    this.updateProgressInterval = setInterval(() => {
      if (this.isPlaying && this.current) {
        this.$store.commit(
          'liveProgress',
          this.$store.getters.liveProgress + 1000 / FPS
        )
      }
    }, 1000 / FPS)
  },
  destroyed() {
    clearInterval(this.updateProgressInterval)
    this.updateProgressInterval = null
  }
}
</script>

<style lang="scss" scoped>
.item-left {
  margin-right: 1em;
}
.item h1 {
  margin: 0.2em 0;
  font-size: 1.3em;
}
.item h2 {
  margin: 0;
  font-size: 1.1em;
}
.item img {
  border-radius: 0.25em;
  width: 64px;
}
.item .popularity {
  font-size: 1.1em;
  margin-top: 0.5em;
}

.progress {
  background-color: $primary;
  top: 0;
  left: 0;
  bottom: 0;
  position: absolute;;
}
</style>
