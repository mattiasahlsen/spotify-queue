<template>
  <div class="home">
    <!--
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
     
    <p class="spacing-y">...or...</p>
    -->

    <div>
      <button
        v-if="authorized"
        class="btn btn-primary btn-big spacing-x"
        @click="newQueue"
      >
        Create new queue
      </button>
      <div v-else>
        <a
          class="btn btn-primary btn-big spacing-x"
          :href="loginUrl"
        >
          Connect to Spotify
        </a>
        <p class="spacing-y">...to create queue</p>
      </div>
    </div>

    <div class="description">
      <ol>
        <li>Connect to Spotify.</li>
        <li>Create new queue.</li>
        <li>Share the queue link with your friends.</li>
        <li>Everybody adds tracks.</li>
      </ol>
      <ul class="perks">
        <li>
          The queue is fair! Everybody has an
          equal chance to get their song next.
        </li>
        <li>Only the host of the queue needs a Spotify account!</li>
      </ul>
    </div>

  </div>
</template>

<script>
import querystring from 'querystring'
import config from '../config'
import { showErr } from '../lib'

export default {
  data() {
    return {
      queueLink: '',
      badQueueLink: false,
    }
  },
  computed: {
    authorized() {
      return this.$store.getters.authorized
    },
    loginUrl() {
      return config.server + '/login?' + querystring.stringify({
        redirect: window.location.origin + window.location.pathname
      })
    },
  },
  methods: {
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
    newQueue() {
      return this.$store.dispatch('newQueue').catch(showErr)
    },
  }
}
</script>

<style scoped lang="scss">
.home {
  text-align: center;
}
.description {
  text-align: left;
  margin-top: 2em;
}
.perks {
  font-size: 1.2em;
}
</style>
