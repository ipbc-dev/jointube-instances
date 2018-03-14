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
        <td>{{ props.row.name }}</td>
        <td>
          <a :href="getUrl(props.row.host)" target="_blank">{{ props.row.host }}</a>
        </td>
        <td>{{ props.row.version }}</td>
        <td class="text-end">{{ props.row.totalUsers }}</td>
        <td class="text-end">{{ props.row.totalLocalVideos }}</td>
        <td class="text-end">{{ props.row.totalInstanceFollowing }}</td>
        <td class="text-end">{{ props.row.totalInstanceFollowers }}</td>
      </template>
    </vue-good-table>
  </div>
</template>

<style lang="scss">
  .text-end { text-align: end; }

  .emptystate { text-align: center; }
</style>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator'

  import { Instance } from '../../../shared/models/instance.model'
  import { listInstances } from '../shared/instance-http'

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
        sortable: true
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
        field: 'totalInstanceFollowers',
        sortable: true,
        type: 'number'
      },
      {
        label: 'Followers',
        field: 'totalInstanceFollowing',
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

    private async loadData () {
      const response = await listInstances()

      this.rows = response.data
    }
  }
</script>
