<template>
  <div class="manage">
    <Controls/>
    <div class="options">
      <Devices/>
      <button
        class="btn btn-standard btn-error delete-button"
        @click="deleteQueue"
      >
        Delete queue
      </button>
    </div>
  </div>
</template>

<script>
import Controls from './Controls'
import Devices from './Devices'

import { showErr } from '../lib'

export default {
  components: {
    Controls,
    Devices,
  },
  computed: {
  },
  methods: {
    deleteQueue() {
      this.$store.dispatch('deleteQueue').catch(showErr)
    },
  }
}
</script>

<style scoped lang="scss">
.manage {
  margin: 1em 0;
}
.options {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.delete-button {
  margin-left: 0.5em;
}
</style>
