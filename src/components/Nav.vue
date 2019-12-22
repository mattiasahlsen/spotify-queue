<template>
  <div class="nav">
    <div v-if="accessToken && userData" class="nav-content">
      <button class="btn btn-secondary spacing-right" @click="logout">LOG OUT</button>
      <p class="username">{{userData.id}}</p>
      <img v-if="userData.images && userData.images.length > 0" class="user-image" :src="userData.images[0].url">
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  computed: {
    accessToken() {
      return this.$store.state.auth.accessToken
    },
    userData() {
      return this.$store.state.auth.userData
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
    }
  }
}
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  padding: 1em 2em;
  height: 3em;
  justify-content: flex-end;
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
</style>
