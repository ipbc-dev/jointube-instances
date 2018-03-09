<template>
  <div>
    <div v-for="instance of instances">
      {{ instance.host }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class InstanceList extends Vue {
  instances: []
}
</script>
