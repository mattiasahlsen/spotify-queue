<template>
  <div class="home">
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

    <div class="spacing-y">
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
</style>
