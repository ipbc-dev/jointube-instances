import { AllowNull, Column, CreatedAt, DataType, Is, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { isHostValid } from '../helpers/custom-validators/instances'
import { getSort, throwIfNotValid } from '@peertube/server/models/utils'
import { ServerConfig } from '@peertube/shared/models'
import { ServerStats } from '@peertube/shared/models/server/server-stats.model'

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

  toFormattedJSON () {
    return {
      id: this.id,
      host: this.host,
      stats: this.stats
    }
  }
}
