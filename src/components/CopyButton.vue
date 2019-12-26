<template>
  <button
    class="btn btn-standard"
    v-clipboard:copy="value"
    v-tooltip="{
      content: 'Copied to clipboard',
      classes: ['copied-tooltip'],
      trigger: 'manual',
      delay: {
        hide: 500,
      },
      show,
    }"
    @click="showTooltip"
  >
    {{text}}
  </button>
</template>

<script>
export default {
  props: ['value', 'text'],
  data() {
    return {
      show: false
    }
  },
  methods: {
    showTooltip() {
      this.show = true
      setTimeout(() => this.show = false, 1000)
    },
  }
}
</script>
