<template>
  <div id="app">
    <modal
      name="error"
      classes="error"
      :adaptive="true"
      width="90%"
    >
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
      <div class="content-container">
        <div class="content">

          <div v-if="!queueId || notFound">
            <Home/>
            <h1 v-if="notFound" class="error-text">
              Queue not found
            </h1>
          </div>

          <div v-else>
            <clip-loader
              v-if="loading"
              color="#1cca59"
              :loading="true"
            ></clip-loader>


            <div v-else>
              <Manage v-if="owner"/>

              <h2 class="spacing-y">Queue link</h2>
              <div class="queue-id">
                <p>{{href}}</p>
                <CopyButton :value="href" text="Copy sharable link"/>
              </div>


              <div class="spacing">
                <div class="items">
                  <Current class="spacing-y"/>
                  <Search class="spacing-y"/>
                  <Tracks class="spacing-y"/>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import querystring from 'querystring'
import io from 'socket.io-client'

import Nav from './components/Nav'
import Manage from './components/Manage'
import Current from './components/Current'
import Tracks from './components/Tracks'
import Search from './components/Search'
import CopyButton from './components/CopyButton'
import Home from './components/Home'

import store from './store'

import config from './config'
import { showErr, queueUrl } from './lib'


export default {
  name: 'app',
  components: {
    Tracks,
    Nav,
    Manage,
    Current,
    Search,
    CopyButton,
    Home,
  },
  data() {
    return {
      error: null,

      queue: [],

      href: window.location.href,
      socket: null,
    }
  },
  watch: {
    '$store.state.error': function(err) {
      if (err) this.displayError()
    },
    queueId: function(val) {
      this.href = window.location.href
      this.fetchQueue()

      this.socket.emit('queue', val)
    }
  },
  computed: {
    loading() {
      return this.$store.state.queue.loading
    },
    queueId() {
      return this.$route.params.queueId
    },
    notFound() {
      return this.$store.state.queue.notFound
    },
    owner() {
      return this.$store.getters.owner
    },
    onQueue() {
      return this.$store.getters.onQueue
    }
  },
  created() {
    if (this.$route.query.error) showErr(this.$route.query.error)

    this.authenticate().then(() => {
      this.fetchQueue()

      this.socket = io(config.server)
      if (this.queueId) this.socket.emit('queue', this.queueId)

      this.socket.on('current', data => {
        this.$store.commit('progress', data.progress)
        this.$store.commit('currentTrack', data.track)
      })
      this.socket.on('status', data => {
        this.$store.commit('progress', data.progress)
        this.$store.commit('isPlaying', data.isPlaying)
      })
    }).catch(showErr)
  },
  methods: {
    fetchQueue() {
      if (this.queueId) {
        this.$store.dispatch('fetchQueue')
          .catch(err => {
            if (err.status !== 404) throw err
          }).catch(showErr)
      }
    },
    play() {
      this.$store.dispatch('play')
        .catch(showErr)
    },
    authenticate() {
      return this.$store.dispatch('authenticate')
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
.new-queue {
  border-radius: 1px;
  font-size: 1.2em;
}


.content-container {
  max-width: 100%;
}
.content {
  margin: 0 0.5em;
}

.items {
  display: flex;
  flex-direction: column;

  h2 {
    margin-bottom: 0.2em;
  }
}

.selects {
  display: inline-flex;
  flex-wrap: wrap;
}
.selects select {
  flex: 1 0 auto;
}

.clear-tracks {
  display: flex;
  justify-content: flex-end;
}

.queue-id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $light-2;
  button {
    background-color: $dark-1;
    color: $light-2;
    &:hover:enabled {
      background-color: $dark-2;
    }
  }
  p {
    color: $dark-1;
    font-size: 1.2em;
    margin: 0.1em;
    overflow: hidden;
  }
}

.copied-tooltip {
  background-color: $light-2;
  color: $dark-1;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 0.4em;
  padding: 0.2em;
  border-radius: 1px;
}

</style>
