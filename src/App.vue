<template>
  <div id="app">
    <modal
      name="error"
      classes="error"
      :adaptive="true"
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

          <form @submit.prevent="connect" class="search-container spacing-y">
            <input
              class="search-bar"
              placeholder="Enter queue link..."
              v-model="queueLink"
            >
            <button
              class="btn btn-standard spacing-x"
              type="submit"
            >
              Connect
            </button>
          </form>

          <h2 v-if="badQueueLink" class="error-text">
            Invalid queue link
          </h2>

          <div class="new-queue">
            <button
              v-if="authorized"
              class="btn btn-primary btn-big spacing-x"
              @click="newQueue"
            >
              New Queue
            </button>
            <a
              v-else
              class="btn btn-primary btn-big spacing-x"
              :href="loginUrl"
            >
              Authenticate
            </a>
          </div>

          <clip-loader
            v-if="loading"
            color="#1cca59"
            :loading="true"
          ></clip-loader>

          <h2 v-else-if="notFound" class="error-text">
            Queue not found
          </h2>

          <div v-else-if="queueId">
            <h2 class="spacing-y">Queue link</h2>
            <div class="queue-id">
              <p>{{href}}</p>
              <CopyButton :value="href" text="Copy sharable link"/>
            </div>

            <Manage v-if="owner" class="manage"/>

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
</template>

<script>
import querystring from 'querystring'
import io from 'socket.io-client'

import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import Nav from './components/Nav'
import Manage from './components/Manage'
import Current from './components/Current'
import Tracks from './components/Tracks'
import Search from './components/Search'
import CopyButton from './components/CopyButton'

import store from './store'

import config from './config'
import { showErr, queueUrl } from './lib'


export default {
  name: 'app',
  components: {
    ClipLoader,
    Tracks,
    Nav,
    Manage,
    Current,
    Search,
    CopyButton,
  },
  data() {
    return {
      error: null,

      queue: [],

      queueLink: '',
      badQueueLink: false,

      server: config.server,
      href: window.location.href,
      socket: null,
    }
  },
  watch: {
    '$store.state.error': function(err) {
      if (err) this.displayError()
    },
    '$store.getters.progress': function(val) {
      /*fetch(queueUrl('/queue/progress'), {
        ...this.$store.getters.serverFetchOptions,
        method: 'POST',
        body: JSON.stringify({ progress: val })
      }).catch(err => console.log(err))*/
    },
    queueId: function(val) {
      this.href = window.location.href
      this.fetchQueue()

      this.socket.emit('queue', val)
    }
  },
  computed: {
    loginUrl() {
      return this.server + '/login?' + querystring.stringify({
        redirect: window.location.origin + window.location.pathname
      })
    },
    authorized() {
      return this.$store.getters.authorized
    },
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

      this.socket = io(this.server)
      if (this.queueId) this.socket.emit('queue', this.queueId)

      this.socket.on('current', track => {
        this.$store.commit('progress', 0)
        this.$store.commit('currentTrack', track)
      })
      this.socket.on('status', data => {
        this.$store.commit('progress', data.progress)
        this.$store.commit('isPlaying', data.isPlaying)
      })
    }).catch(showErr)
  },
  methods: {
    newQueue() {
      return this.$store.dispatch('newQueue').catch(showErr)
    },
    fetchQueue() {
      if (this.queueId) {
        this.$store.dispatch('fetchQueue')
          .catch(err => {
            if (err.status !== 404) throw err
          }).catch(showErr)
      }
    },
    connect() {
      const link = this.queueLink.includes('http') ?
        this.queueLink : 'http://' + this.queueLink

      let url
      try {
        url = new URL(link)
      } catch (err) {
        this.badQueueLink = true
        return
      }

      if (
        url.origin !== window.location.origin ||
        url.pathname === '/'
      ) {
        this.badQueueLink = true
        return
      }
      this.badQueueLink = false
      if (url.pathname !== window.location.pathname) {
        this.$router.push(url.pathname)
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

.manage {
  margin: 1em 0;
}

.new-queue {
  margin: 1em 0;
  text-align: center;
}

.error-text {
  margin: 0.5em 0 1em;
  text-align: center;
  color: $error;
}

.search-bar {
  flex: 1 0 0;
}
</style>
