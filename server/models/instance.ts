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
      order: getSort(sort)
    }

    return InstanceModel.findAndCountAll(query)
      .then(({ rows, count }) => {
        return {
          data: rows,
          total: count
        }
      })
  }

  toFormattedJSON (): Instance {
    return {
      id: this.id,
      host: this.host,
      config: this.config,
      stats: this.stats
    }
  }
}
