<template>
  <div v-if="stats">
    <div class="block col-md-2">
      <span class="value">{{ stats.totalInstances | formatNumber }}</span>
      <span class="label">Instances</span>
    </div>

    <div class="block col-md-2">
      <span class="value">{{ stats.totalUsers | formatNumber }}</span>
      <span class="label">Users</span>
    </div>

    <div class="block col-md-2">
      <span class="value">{{ stats.totalVideos | formatNumber }}</span>
      <span class="label">Videos</span>
    </div>

    <div class="block col-md-2">
      <span class="value">{{ stats.totalVideoComments | formatNumber }}</span>
      <span class="label">Comments</span>
    </div>

    <div class="block col-md-2">
      <span class="value">{{ stats.totalVideoViews | formatNumber }}</span>
      <span class="label">Views</span>
    </div>
  </div>
</template>

<style lang="scss">

  .block {
    display: inline-block;
    border-radius: 3px;
    background-color: #488bf7;
    color: #fff;
    margin: 15px;
    padding: 30px;

    .label, .value {
      display: block;
      text-align: center;
    }

    .label {
      text-transform: uppercase;
      font-size: 0.8em;
    }

    .value {
      font-weight: bold;
      font-size: 1.5em;
      margin-bottom: 10px;
    }
  }

</style>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'

  import { InstanceStats as InstanceStatsModel } from '../../../shared/models/instance-stats.model'
  import { getInstanceStats } from '../shared/instance-http'

  @Component({
    filters: {
      formatNumber: (value: number) => value.toLocaleString()
    }
  })
  export default class InstanceStats extends Vue {
    stats: InstanceStatsModel | null = null

    async mounted () {
      this.stats = await getInstanceStats()
    }
  }
</script>
