<template>
  <div id="app">
    <modal name="error" classes="error">
      <div>
        <h1>Error</h1>
        <p>{{$store.getters.error}}</p>
      </div>
      <div>
        <button class="btn btn-standard" @click="hideError">Close</button>
      </div>
    </modal>

    <Nav></Nav>

    <div class="container">
      <clip-loader
        v-if="loading"
        color="#1cca59"
        :loading="true"
      ></clip-loader>

      <div v-else-if="!queueId">
        <button class="btn btn-primary btn-big spacing-x" @click="newQueue">
          New Queue
        </button>
        <button class="btn btn-primary btn-big spacing-x">
          Connect to queue
        </button>
      </div>

      <div class="content" v-else-if="queueId">
        <div v-if="accessToken">
          <Controls></Controls>

          <div class="queue-buttons">
            <div>
              <button
                class="btn btn-standard"
                @click="deleteQueue"
              >
                Add song
              </button>
            </div>
            <div>
              <button
                class="btn btn-standard btn-error"
                @click="deleteQueue"
              >
                Delete queue
              </button>
            </div>
          </div>
        </div>

        <div class="spacing">
          <div class="items">
            <h2>Currently playing</h2>
            <div class="item-container">
              <clip-loader
                v-if="loadingCurrent"
                class="spacing"
                color="#1cca59"
                :loading="true"
              ></clip-loader>

              <Track
                v-else-if="currentTrack"
                :track="currentTrack"
                :current="currentlyPlayingData"
              />
              <p class="spacing" v-else>Queue is empty</p>
            </div>
            <p v-if="!onQueue">Queue is not playing</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import Nav from './components/Nav'
import Track from './components/Track'
import Controls from './components/Controls'
import store from './store'

import config from './config'
import { showErr } from './lib'



export default {
  name: 'app',
  components: {
    ClipLoader,
    Track,
    Nav,
    Controls,
  },
  data() {
    return {
      server: config.server,
      error: null,

      queue: [],

      currentlyPlayingInterval: null,
    }
  },
  watch: {
    '$store.state.error': function(err) {
      if (err) this.displayError()
    },
    '$store.getters.progress': function(val) {
      fetch(config.server + '/queue/progress', {
        ...this.$store.getters.serverFetchOptions,
        method: 'POST',
        body: JSON.stringify({ progress: val })
      }).catch(err => console.log(err))

    }
  },
  computed: {
    onQueue() {
      return this.$store.getters.onQueue
    },
    accessToken() {
      return this.$store.state.auth.accessToken
    },

    loading() {
      return this.$store.state.auth.loading || this.$store.state.queue.loading
    },
    loadingCurrent() {
      return this.$store.state.track.loading
    },

    queueId() {
      return this.$store.state.queue.queueId
    },
    currentTrack() {
      return this.$store.state.track.currentTrack
    },
    currentlyPlayingData() {
      return this.$store.state.player.currentlyPlaying
    }
  },
  created() {
    this.currentlyPlaying()
    this.fetchAccessToken().then(token => {
      // must wait for the first request to finish to create session
      this.fetchQueueId().catch(showErr)
    }).catch(showErr)
  },
  methods: {
    newQueue() {
      if (!this.accessToken) this.$router.push(this.server + '/login')
      else this.$store.dispatch('newQueue').catch(showErr)
    },
    deleteQueue() {
      this.$store.dispatch('deleteQueue').catch(showErr)
    },
    play() {
      this.$store.dispatch('play').catch(showErr)
    },
    currentlyPlaying() {
      const LONG = 5000 // 5s
      const SHORT = 1000 // 1s
      const refresh = this.currentlyPlaying.bind(this)

      if (!(this.accessToken && this.queueId)) {
        return setTimeout(refresh, LONG)
      }

      return this.$store.dispatch('fetchCurrentlyPlaying').then(data => {
        if (!data) return setTimeout(refresh, LONG)

        const msLeft = data.item.duration_ms - data.progress_ms
        if (msLeft > 2 * LONG) {
          setTimeout(refresh, LONG)
        } else setTimeout(refresh, SHORT)
        if (msLeft < 1000 && this.$store.getters.onQueue) {
          this.$store.dispatch('playNext')
        } 
      }).catch(showErr)
    },
    fetchQueueId() {
      return this.$store.dispatch('fetchQueueId')
    },
    playNext() {
      this.$store.dispatch('playNext')
    },
    fetchAccessToken() {
      return this.$store.dispatch('fetchAccessToken')
    },

    displayError(err) {
      this.$modal.show('error')
    },
    hideError() {
      this.$store.commit('clearError')
      this.$modal.hide('error')
    },
    showErr,
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  font-family: 'Montserrat', sans-serif;
  text-align: center;

  background-color: $background;
  color: $text;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  min-height: 100vh;
}


.error {
  color: $light-1;
  background-color: $error;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 1em;
}
.btn-standard {
  border-radius: 1px;
  font-size: 1.1em;
  width: 8em;
  margin: 0.5em;
}
.btn-error {
  color: $light-1;
  background-color: $error;
  &:hover {
    background-color: $error-2;
  }
}
.new-queue {
  border-radius: 1px;
  font-size: 1.2em;
}

.queue-buttons {
  display: flex;
  justify-content: space-between;
}

.content {
  max-width: 100%;
}

.items {
  display: flex;
  flex-direction: column;

  h2 {
    margin-bottom: 0.2em;
  }
}
.item-container {
  background-color: $secondary;
  margin: 0.5em 0;
  border-radius: 0.5em;
  position: relative;
  overflow: hidden;
}

.selects {
  display: inline-flex;
  flex-wrap: wrap;
}
.selects select {
  flex: 1 0 auto;
}
</style>
