<template>
  <div>
    <vue-good-table
      :columns="columns"
      :rows="rows"
      :lineNumbers="false"
      styleClass="table table-bordered table-stripped"
    >
      <div slot="emptystate">
        Loading...
      </div>

      <template slot="table-row" slot-scope="props">
        <td class="name" :title="props.row.name">{{ props.row.name }}</td>
        <td class="host">
          <a :href="getUrl(props.row.host)" target="_blank">{{ props.row.host }}</a>
        </td>
        <td class="version">{{ props.row.version }}</td>
        <td class="text-end">{{ props.row.totalUsers }}</td>
        <td class="text-end">{{ props.row.totalLocalVideos }}</td>
        <td class="text-end">{{ props.row.totalInstanceFollowing }}</td>
        <td class="text-end">{{ props.row.totalInstanceFollowers }}</td>
        <td class="text-end">{{ props.row.totalVideos }}</td>
        <td class="text-end">
          <span class="check-mark" v-if="props.row.signupAllowed">&#x2714;</span>
          <span v-else>&#x274C;</span>
        </td>
        <td class="icon-cell" :title="props.row.health + '%'">
          <font-awesome-icon class="health-icon"
                             :icon="getIcon(props.row.health)" :style="{ color: getIconColor(props.row.health) }"
          ></font-awesome-icon>
        </td>
      </template>
    </vue-good-table>
  </div>
</template>

<style lang="scss">
  th.sorting {
    cursor: pointer;
  }

  td, th {
    font-size: 0.8em;
  }

  .emptystate { text-align: center; }

  .text-end { text-align: end; }

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
    columns = [
      {
        label: 'Name',
        field: 'name',
        sortable: true
      },
      {
        label: 'Url',
        field: 'host',
        sortable: true
      },
      {
        label: 'Version',
        field: 'version',
        sortable: true,
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
        sortable: true,
        sortFn: function (x: boolean, y: boolean) {
          if (x < y) return 1
          if (x === y) return 0
          return -1
        }
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
