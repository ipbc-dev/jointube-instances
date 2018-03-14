<template>
  <div>
    <div v-if="err" class="alert alert-danger">
      {{ err }}
    </div>

    <div v-if="messageSuccess" class="alert alert-success">
      {{ messageSuccess }}
    </div>

    <form @submit="onSubmit">
      <div class="form-group">
        <label for="host">Host (without https://)</label>
        <input v-model="host" class="form-control" type="text" name="host" id="host" />
      </div>

      <input :disabled="loading === true" class="btn btn-primary" type="submit" value="Add your instance" />
    </form>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { addInstance } from '../shared/instance-http'
  import { httpErrorToString } from '../shared/utils'

  @Component
  export default class InstanceAdd extends Vue {
    host = ''
    err = ''
    messageSuccess = ''
    loading = false

    onSubmit (event: Event) {
      event.preventDefault()

      this.loading = true
      this.err = ''
      this.messageSuccess = ''

      addInstance(this.host)
        .then(() => {
          this.loading = false
          this.host = ''
          this.messageSuccess = `${this.host} has been successfully added.`
        })
        .catch(err => {
          this.loading = false
          this.err = httpErrorToString(err)
        })
    }
  }
</script>
