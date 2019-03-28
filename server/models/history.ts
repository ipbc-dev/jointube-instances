import { AllowNull, BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceModel } from './instance'
import * as Sequelize from 'sequelize'
import { MAX_HISTORY_SIZE } from '../initializers/constants'

@Table({
  tableName: 'history',
  indexes: [
    {
      fields: [ 'instanceId' ]
    }
  ]
})
export class HistoryModel extends Model<HistoryModel> {

  @AllowNull(false)
  @Column(DataType.JSONB)
  stats: ServerStats

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @ForeignKey(() => InstanceModel)
  @Column
  instanceId: number

  @BelongsTo(() => InstanceModel, {
    foreignKey: {
      allowNull: false
    },
    onDelete: 'cascade'
  })
  Instance: InstanceModel

  static doesTodayHistoryExist (instanceId: number) {
    const today = new Date()
    today.setHours(0, 0, 0)

    const query = 'SELECT 1 FROM "history" WHERE "instanceId" = $instanceId AND DATE("createdAt") = CURRENT_DATE LIMIT 1'
    const options = {
      type: Sequelize.QueryTypes.SELECT,
      bind: { instanceId },
      raw: true
    }

    return HistoryModel.sequelize.query(query, options)
                     .then(results => {
                       return results.length === 1
                     })
  }

  static async addEntryIfNeeded (instanceId: number, stats: ServerStats) {
    // Only add 1 entry per day
    const exists = await HistoryModel.doesTodayHistoryExist(instanceId)
    if (exists) return

    return HistoryModel.create({
      stats,
      instanceId
    })
  }

  static getInstanceHistory (instanceId: number) {
    const query = {
      order: [ [ 'createdAt', 'DESC' ] ],
      limit: MAX_HISTORY_SIZE,
      where: {
        instanceId
      }
    }

    return HistoryModel.findAll(query)
  }

  static async getGlobalStats () {
    const query = 'SELECT ' +
      'DATE("history"."createdAt") as "date", ' +
      'COUNT(*) as "totalInstances", ' +
      'SUM(("history".stats->>\'totalUsers\')::integer) as "totalUsers", ' +
      'SUM(("history".stats->>\'totalLocalVideos\')::integer) as "totalVideos", ' +
      'SUM(("history".stats->>\'totalLocalVideoComments\')::integer) as "totalVideoComments", ' +
      'SUM(("history".stats->>\'totalLocalVideoViews\')::integer) as "totalVideoViews", ' +
      'SUM(("history".stats->>\'totalLocalVideoFilesSize\')::bigint) as "totalVideoFilesSize" ' +
      'FROM "history" ' +
      'INNER JOIN "instance" ON "history"."instanceId" = "instance"."id" ' +
      'WHERE instance.blacklisted IS FALSE ' +
      'GROUP BY DATE("history"."createdAt") ' +
      'LIMIT ' + MAX_HISTORY_SIZE

    return InstanceModel.sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
                        .then(results => results.map(res => ({
                          date: res.date,
                          stats: {
                            totalInstances: res.totalInstances,
                            totalUsers: res.totalUsers,
                            totalVideos: res.totalVideos,
                            totalVideoComments: res.totalVideoComments,
                            totalVideoViews: res.totalVideoViews,
                            totalVideoFilesSize: res.totalVideoFilesSize
                          }
                        })))
  }

  toFormattedJSON () {
    return {
      date: this.createdAt.toISOString().split('T')[0],

      stats: {
        totalUsers: this.stats.totalUsers,
        totalVideos: this.stats.totalVideos,
        totalLocalVideos: this.stats.totalLocalVideos,
        totalInstanceFollowers: this.stats.totalInstanceFollowers,
        totalInstanceFollowing: this.stats.totalInstanceFollowing
      }
    }
  }
}
