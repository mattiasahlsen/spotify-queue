<template>
  <div>
    <Controls></Controls>

    <div class="queue-buttons">
      <div>
        <button
          class="btn btn-standard btn-error spacing"
          @click="deleteQueue"
        >
          Delete queue
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Controls from './Controls'

import { showErr } from '../lib'

export default {
  components: {
    Controls,
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
.queue-buttons {
  display: flex;
  justify-content: flex-end;
}
</style>
