<template>
  <div>
    <clip-loader
      v-if="loading"
      :loading="true"
      color="#1cca59"
    ></clip-loader>
    <multiselect
      v-else-if="devices"
      class="clickable devices"
      v-model="device"
      :searchable="false"
      :closeOnSelect="true"
      :options="devices"
      :multiple="false"
      :allowEmpty="false"
      :showLabels="false"
      label="name"
      placeholder="Select device"
    >
      <template slot="singleLabel" slot-scope="props">
        <span class="label">{{props.option.name}}</span>
      </template>
    </multiselect>
    <p v-else class="error-text">Error loading devices</p>
  </div>
</template>

<script>
import { showErr, queueUrl, checkStatus, serverFetchOptions } from '../lib'
export default {
  data() {
    return {
      devices: null,
      loading: true,
      device: null,
    }
  },
  watch: {
    device(newDevice, oldDevice) {
      if (!newDevice) return

      this.setDevice(newDevice.id)
        .then(device => {
          this.$store.commit('deviceId', newDevice.id)
        })
        .catch(err => {
          this.device = oldDevice
          showErr(err)
        })
    }
  },
  created() {
    this.fetchDevices()
      .catch(showErr)
      .finally(() => this.loading = false)
  },
  methods: {
    fetchDevices() {
      const path = '/spotify/devices'
      return fetch(queueUrl(path), serverFetchOptions)
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          this.devices = data.devices
          if (data.deviceId) {
            this.device = this.devices.find(d => d.id === data.deviceId)
          }
        })
    },
    setDevice(id) {
      const path = '/spotify/device'
      return fetch(queueUrl(path), {
        ...serverFetchOptions,
        method: 'POST',
        body: JSON.stringify({ id })
      })
        .then(checkStatus)
    }
  }
}
</script>

<style scoped lang="scss">
.devices {
  width: 10em;
}
.label {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
</style>
