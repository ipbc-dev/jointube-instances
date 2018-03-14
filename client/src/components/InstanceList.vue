<template>
  <div>
    <vue-good-table
      :columns="columns"
      :rows="rows"
      :paginate="true"
      :lineNumbers="false"
      styleClass="table table-bordered"
    >
      <template slot="table-row" slot-scope="props">
        <td>{{ props.row.config.instance.name }}</td>
        <td>
          <a :href="getUrl(props.row.host)" target="_blank">{{ props.row.host }}</a>
        </td>
        <td>{{ props.row.stats.totalUsers }}</td>
        <td>{{ props.row.stats.totalLocalVideos }}</td>
        <td>{{ props.row.stats.totalInstanceFollowing }}</td>
        <td>{{ props.row.stats.totalInstanceFollowers }}</td>
      </template>
    </vue-good-table>
  </div>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator'

  import { Instance } from '../../../shared/models/instance.model'
  import { listInstances } from '../shared/instance-http'

  @Component
  export default class InstanceList extends Vue {
    columns = [
      {
        label: 'Name'
      },
      {
        label: 'Url'
      },
      {
        label: 'Users'
      },
      {
        label: 'Local videos'
      },
      {
        label: 'Following'
      },
      {
        label: 'Followers'
      }
    ]
    rows: Instance[] = [ ]

    async mounted () {
      const response = await listInstances()

      this.rows = response.data
    }

    getUrl (host: string) {
      return 'https://' + host
    }
  }
</script>
