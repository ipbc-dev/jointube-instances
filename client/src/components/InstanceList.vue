<template>
  <div>

    <div class="top-text">
      This list is an unmoderated index of public PeerTube instances so it may contain sensitive content.

      PeerTube contributors and Framasoft declines any responsibility for what's listed and linked below.

      However, Framasoft may exclude some entries that are not PeerTube instances, or instances that fake some video metadata (so we can have reliable stats).
    </div>

    <vue-good-table
      :columns="columns"
      :rows="rows"
      :search-options="searchOptions"
      :sort-options="sortOptions"
      :lineNumbers="false"
      styleClass="table table-bordered table-stripped"
    >
      <div slot="emptystate">
        Loading...
      </div>

      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field === 'name'" :title="props.row.name">{{ props.row.name }}</span>

        <a v-else-if="props.column.field === 'host'" :href="getUrl(props.row.host)" target="_blank">{{ props.row.host }}</a>

        <div class="text-center" v-else-if="props.column.field === 'signupAllowed'">
          <span class="check-mark" v-if="props.row.signupAllowed">&#x2714;</span>
          <span v-else>&#x274C;</span>
        </div>

        <div class="text-center" style="max-height:20px;" v-else-if="props.column.field === 'country'">
          <country-flag :country="props.row.country" style="margin-top:-21px;"/>
        </div>

        <div
          v-else-if="props.column.field === 'health'" class="icon-cell"
          :title="'Over the course of the last 4 days, the instance was available ' + props.row.health + '% of the time.'"
        >
          <font-awesome-icon class="health-icon"
                             :icon="getIcon(props.row.health)" :style="{ color: getIconColor(props.row.health) }"
          ></font-awesome-icon>
        </div>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
    </vue-good-table>
  </div>
</template>

<style lang="scss">
  th {
    cursor: pointer;
  }

  td, th {
    font-size: 0.8em;
    vertical-align: middle !important;
  }

  .emptystate { text-align: center; }

  .text-end { text-align: end; }
  .text-center { text-align: center; }

  .name, .host {
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name, .host, .version {
    padding-right: 5px !important;
  }

  .icon-cell {
    padding: 0 !important;
    text-align: center !important;
    vertical-align: middle !important;

    .health-icon {
      width: 20px !important;
      height: 20px !important;
    }
  }

  .top-text {
    font-size: 14px;
    margin-bottom: 20px;
  }
</style>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator'

  import * as semver from 'semver'
  import { Instance } from '../../../shared/models/instance.model'
  import { listInstances } from '../shared/instance-http'
  import faSmile from '@fortawesome/fontawesome-free-solid/faSmile'
  import faMeh from '@fortawesome/fontawesome-free-solid/faMeh'
  import faFrown from '@fortawesome/fontawesome-free-solid/faFrown'

  @Component
  export default class InstanceList extends Vue {
    searchOptions = {
      enabled: true,
      placeholder: 'Search among instances',
      searchFn: (row: any, col: any, cellValue: any, searchTerm: string) => {
        return row.name.includes(searchTerm) || row.host.includes(searchTerm)
      }
    }

    sortOptions = {
      enabled: true
    }

    columns = [
      {
        label: 'Name',
        field: 'name',
        sortable: true,
        filterable: true,
        tdClass: 'name'
      },
      {
        label: 'Url',
        field: 'host',
        sortable: true,
        filterable: true,
        tdClass: 'host'
      },
      {
        label: 'Version',
        field: 'version',
        sortable: true,
        tdClass: 'version',
        sortFn: function (v1: string, v2: string) {
          if (semver.lt(v1, v2)) return 1
          if (v1 === v2) return 0
          return -1
        }
      },
      {
        label: 'Users',
        field: 'totalUsers',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Local videos',
        field: 'totalLocalVideos',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Following',
        field: 'totalInstanceFollowing',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Followers',
        field: 'totalInstanceFollowers',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Total videos',
        field: 'totalVideos',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Signup',
        field: 'signupAllowed',
        type: 'boolean',
        sortable: true,
        sortFn: function (x: boolean, y: boolean) {
          if (x < y) return 1
          if (x === y) return 0
          return -1
        }
      },
      {
        label: 'Location',
        field: 'country',
        type: 'string',
        sortable: false
      },
      {
        label: 'Health',
        field: 'health',
        sortable: true,
        type: 'number'
      }
    ]
    rows: Instance[] = [ ]

    async mounted () {
      this.loadData()
    }

    getUrl (host: string) {
      return 'https://' + host
    }

    getIcon (health: number) {
      if (health > 90) return faSmile
      if (health > 50) return faMeh
      return faFrown
    }

    getIconColor (health: number) {
      if (health > 98) return '#08cd36'
      if (health > 90) return '#81c307'
      if (health > 70) return '#cfb11b'
      if (health > 50) return '#e67a3c'
      if (health > 20) return '#e7563c'

      return '#f44141'
    }

    private async loadData () {
      const response = await listInstances()

      this.rows = response.data
    }
  }
</script>
