<template>
  <div class="nav">
    <div class="logo">
      <img src="/logo.png" @click="goHome" class="logo-image clickable">
      <h4>In beta</h4>
    </div>
    <div v-if="authorized" class="nav-content">
      <button class="btn btn-secondary spacing-right" @click="logout">LOG OUT</button>
      <p class="username">{{userId}}</p>
    </div>
    <div v-else>
      <a
        class="btn btn-secondary spacing-right"
        :href="loginUrl"
      >
        Connect to Spotify
      </a>
    </div>
  </div>
</template>

<script>
import querystring from 'querystring'
import config from '../config'

export default {
  data() {
    return {

    }
  },
  computed: {
    loginUrl() {
      return config.server + '/login?' + querystring.stringify({
        redirect: window.location.origin + window.location.pathname
      })
    },
    authorized() {
      return this.$store.getters.authorized
    },
    userId() {
      return this.$store.state.auth.userId
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
    },
    goHome() {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  padding: 0.5em;
  justify-content: space-between;
  align-items: center;
}
.nav-content {
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
}

.username {
  margin-right: 0.5em;
}
.user-image {
  height: 100%;
  border-radius: 50%;
}
.logo {
  display: flex;
  align-items: center;
  margin-right: 0.5em;
}
.logo-image {
  height: 5em;
  margin-right: 0.1em;
}
</style>
