<template>
  <div class="row">
    <div class="chart col-md-6" v-for="chart in charts">
      <la-cartesian v-bind:width="560" :bound="[0]" :data="chart.data">
        <la-area dot curve prop="value" :label="chart.label"></la-area>

        <la-x-axis v-bind:fontSize="11" prop="date" :interval="interval"></la-x-axis>
        <la-y-axis v-bind:fontSize="11" :format="formatNumber" :interval="interval"></la-y-axis>
        <la-tooltip></la-tooltip>
        <la-legend></la-legend>
      </la-cartesian>
    </div>
  </div>
</template>

<style lang="scss">

  .chart {
    margin-top: 50px;
  }

</style>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { getGlobalStatsHistory } from '../shared/instance-http'

  import { Area, Cartesian, Legend, Tooltip, XAxis, YAxis } from 'laue'
  import { GlobalStats } from '../../../shared/models/global-stats.model'

  @Component({
    components: {
      LaCartesian: Cartesian,
      LaArea: Area,
      LaXAxis: XAxis,
      LaYAxis: YAxis,
      LaTooltip: Tooltip,
      LaLegend: Legend
    }
  })
  export default class InstanceStatsHistory extends Vue {
    charts: any[] = []
    total!: number

    async mounted () {
      const history = await getGlobalStatsHistory()
      const data = history.data.reverse()

      this.charts = [
        this.chartBuilder('Instances', data, 'totalInstances'),
        this.chartBuilder('Videos', data, 'totalVideos'),

        this.chartBuilder('Users', data, 'totalUsers'),

        this.chartBuilder('Comments', data, 'totalVideoComments'),

        this.chartBuilder('File sizes', data, 'totalVideoFilesSize'),

        this.chartBuilder('Views', data, 'totalVideoViews')
      ]

      this.total = data.length
    }

    formatNumber (value: number) {
      const dictionary = [
        { max: 1000, type: '' },
        { max: 1000000, type: 'K' },
        { max: 1000000000, type: 'M' },
        { max: 1000000000000, type: 'G' },
        { max: 1000000000000000, type: 'T' },
      ]

      const format = dictionary.find(d => value < d.max) || dictionary[dictionary.length - 1]
      const calc = Math.floor(value / (format.max / 1000))

      return `${calc}${format.type}`
    }

    interval (i: number) {
      const points = Math.ceil(this.total/4)

      return i === 0 || i === this.total - 1 || i % points === 0
    }

    private chartBuilder (label: string, data: { date: string, stats: GlobalStats }[], key: keyof GlobalStats) {
      return {
        label,
        data: data.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          value: d.stats[key]
        }))
      }
    }
  }
</script>
