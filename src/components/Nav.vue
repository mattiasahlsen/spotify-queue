<template>
  <div class="nav">
    <div v-if="authorized && userId" class="nav-content">
      <button class="btn btn-secondary spacing-right" @click="logout">LOG OUT</button>
      <p class="username">{{userId}}</p>
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
