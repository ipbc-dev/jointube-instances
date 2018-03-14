import { AllowNull, Column, CreatedAt, DataType, Is, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { Instance } from '../../shared/models/instance.model'
import { isHostValid } from '../helpers/custom-validators/instances'
import { getSort, throwIfNotValid } from './utils'

@Table({
  tableName: 'instance',
  indexes: [
    {
      fields: [ 'host' ],
      unique: true
    }
  ]
})
export class InstanceModel extends Model<InstanceModel> {

  @AllowNull(false)
  @Is('Host', value => throwIfNotValid(value, isHostValid, 'valid host'))
  @Column
  host: string

  @AllowNull(false)
  @Column(DataType.JSONB)
  stats: ServerStats

  @AllowNull(false)
  @Column(DataType.JSONB)
  config: ServerConfig

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  static loadByHost (host: string) {
    const query = {
      where: {
        host
      }
    }

    return InstanceModel.findOne(query)
  }

  static listForApi (start: number, count: number, sort: string) {
    const query = {
      offset: start,
      limit: count,
      order: InstanceModel.getSort(sort)
    }

    return InstanceModel.findAndCountAll(query)
      .then(({ rows, count }) => {
        return {
          data: rows,
          total: count
        }
      })
  }

  private static getSort (sort: string) {
    const mappingColumns = {
      totalUsers: 'stats.totalUsers'
    }

    return getSort(sort, [ 'id', 'ASC' ], mappingColumns)
  }

  toFormattedJSON (): Instance {
    return {
      id: this.id,
      host: this.host,

      name: this.config.instance.name,
      version: this.config.serverVersion,
      signupAllowed: this.config.signup.allowed,

      totalUsers: this.stats.totalUsers,
      totalLocalVideos: this.stats.totalLocalVideos,
      totalInstanceFollowers: this.stats.totalInstanceFollowers,
      totalInstanceFollowing: this.stats.totalInstanceFollowing
    }
  }
}
