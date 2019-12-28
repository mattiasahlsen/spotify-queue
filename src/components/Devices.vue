<template>
  <div class="devices">
    <p class="spacing-y">Have Spotify open on the device you wish to use.</p>
    <clip-loader
      v-if="loading"
      :loading="true"
      color="#1cca59"
    ></clip-loader>
    <div v-else>
      <div class="select-container">
        <multiselect
          v-if="devices"
          class="clickable select-device"
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
        
        <font-awesome-icon
          class="clickable-icon sync"
          icon="sync"
          @click="fetchDevices"
        />
      </div>

      <p v-if="!devices" class="error-text">Error loading devices</p>
      <p v-if="deviceError" class="error-text">{{deviceError}}</p>
    </div>
  </div>
</template>

<script>
import { showErr, queueUrl, checkStatus, serverFetchOptions } from '../lib'

let importedSpotifySdk = false

export default {
  data() {
    return {
      devices: null,
      loading: false,
      device: null,
    }
  },
  computed: {
    deviceError() {
      return this.$store.state.player.deviceError
    }
  },
  watch: {
    device(newDevice, oldDevice) {
      if (!newDevice || this.loading) return

      this.sendDevice(newDevice.id)
        .then(device => {
          this.$store.commit('deviceId', newDevice.id)
          this.$store.commit('deviceError', null)
        })
        .catch(err => {
          this.device = oldDevice
          showErr(err)
        })
    }
  },
  created() {
    /*window.onSpotifyWebPlaybackSDKReady = () => {
      // You can now initialize Spotify.Player and use the SDK
      console.log('sdk initialized')
      const player = new Spotify.Player({
        name: 'Queue Player',
        getOAuthToken: callback => {
          callback(this.$store.state.queue.accessToken)
        },
        volume: 0.5
      })
      player.connect().then(success => {
        if (success) {
          console.log('SDK connected')
          this.fetchDevices()
            .catch(showErr)
        }
      })
    }
    if (!importedSpotifySdk) this.importSpotifySdk()
    */

    this.fetchDevices()
      .catch(showErr)
  },
  methods: {
    importSpotifySdk() {
      const script = document.createElement('script')
      script.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
      document.head.appendChild(script)
      importedSpotifySdk = true
    },
    fetchDevices() {
      this.loading = true
      this.devices = null
      const path = '/spotify/devices'
      return fetch(queueUrl(path), serverFetchOptions)
        .then(checkStatus).then(async resp => {
          const data = await resp.json()
          this.devices = data.devices.filter(d => !d.is_restricted)
          if (data.devices.length === 0) {
            this.$store.commit(
              'deviceError',
              'No available devices found.'
            )
          }
          if (data.deviceId) {
            this.$store.commit('deviceId', data.deviceId)
            this.device = this.devices.find(d => d.id === data.deviceId)
          }
        })
        .finally(() => this.loading = false)
    },
    sendDevice(id) {
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
  min-width: 0;
}
.label {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}
.select-container {
  display: flex;
  align-items: center;
}
.select-device {
  min-width: 0;
}
.sync {
  margin-left: 0.5em;
  font-size: 1.2em;
}
</style>
