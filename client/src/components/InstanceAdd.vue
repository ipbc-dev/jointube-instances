<template>
  <div>
    <div v-if="err" class="alert alert-danger">
      {{ err }}
    </div>

    <form @submit="onSubmit">
      <div class="form-group">
        <label for="host">Host (without https://)</label>
        <input v-model="host" class="form-control" type="text" name="host" id="host" />
      </div>

      <input v-if="loading === false" class="btn btn-primary" type="submit" value="Add your instance" />
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
    loading = false

    onSubmit (event: Event) {
      event.preventDefault()

      this.loading = true
      this.err = ''

      addInstance(this.host)
        .then(() => this.loading = false)
        .catch(err => {
          this.loading = false
          this.err = httpErrorToString(err)
        })
    }
  }
</script>
