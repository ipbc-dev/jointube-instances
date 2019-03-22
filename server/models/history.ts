import { AllowNull, BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceModel } from './instance'

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

  static addEntry (instanceId: number, stats: ServerStats) {
    return HistoryModel.create({
      stats,
      instanceId
    })
  }
}
