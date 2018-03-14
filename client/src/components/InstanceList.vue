<template>
  <div>
    <div v-for="instance of instances">
      {{ instance.host }}
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator'

  import { Instance } from '../../../shared/models/instance.model'
  import { listInstances } from '../shared/instance-http'

  @Component
  export default class InstanceList extends Vue {
    instances: Instance[] = [ ]

    async mounted () {
      const response = await listInstances()

      this.instances = response.data
    }

  }
</script>
