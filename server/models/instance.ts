import { AllowNull, Column, CreatedAt, DataType, Default, Is, IsInt, Max, Model, Sequelize, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { Instance } from '../../shared/models/instance.model'
import { isHostValid } from '../helpers/custom-validators/instances'
import { logger } from '../helpers/logger'
import { INSTANCE_SCORE } from '../initializers/constants'
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
  @Default(INSTANCE_SCORE.MAX)
  @IsInt
  @Max(INSTANCE_SCORE.MAX)
  @Column
  score: number

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

  static listHostsWithId () {
    const query = {
      attributes: [ 'id', 'host' ]
    }

    return InstanceModel.findAll(query)
  }

  static updateConfigAndStats (id: number, config: any, stats: any) {
    const options = {
      where: { id }
    }

    return InstanceModel.update({
      config,
      stats
    }, options)
  }

  static async removeBadInstances () {
    const instances = await InstanceModel.listBadInstances()

    const instancesRemovePromises = instances.map(instance => instance.destroy())
    await Promise.all(instancesRemovePromises)

    const numberOfInstancesRemoved = instances.length

    if (numberOfInstancesRemoved) logger.info('Removed bad %d instances.', numberOfInstancesRemoved)
  }

  static async updateInstancesScoreAndRemoveBadOnes (goodInstances: number[], badInstances: number[]) {
    if (goodInstances.length === 0 && badInstances.length === 0) return

    logger.info('Updating %d good instances and %d bad instances scores.', goodInstances.length, badInstances.length)

    if (goodInstances.length !== 0) {
      await InstanceModel.incrementScores(goodInstances, INSTANCE_SCORE.BONUS)
        .catch(err => logger.error('Cannot increment scores of good instances.', err))
    }

    if (badInstances.length !== 0) {
      await InstanceModel.incrementScores(badInstances, INSTANCE_SCORE.PENALTY)
        .then(() => InstanceModel.removeBadInstances())
        .catch(err => logger.error('Cannot decrement scores of bad instances.', err))
    }
  }

  private static listBadInstances () {
    const query = {
      where: {
        score: {
          [Sequelize.Op.lte]: 0
        }
      },
      logging: false
    }

    return InstanceModel.findAll(query)
  }

  private static incrementScores (instances: number[], value: number) {
    const instancesString = instances.map(id => id.toString()).join(',')

    const query = `UPDATE "instance" SET "score" = LEAST("score" + ${value}, ${INSTANCE_SCORE.MAX}) ` +
      'WHERE id IN (' + instancesString + ')'

    const options = {
      type: Sequelize.QueryTypes.BULKUPDATE
    }

    return InstanceModel.sequelize.query(query, options)
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
      shortDescription: this.config.instance.shortDescription,
      version: this.config.serverVersion,
      signupAllowed: this.config.signup.allowed,

      totalUsers: this.stats.totalUsers,
      totalLocalVideos: this.stats.totalLocalVideos,
      totalInstanceFollowers: this.stats.totalInstanceFollowers,
      totalInstanceFollowing: this.stats.totalInstanceFollowing,

      health: Math.round((this.score / INSTANCE_SCORE.MAX) * 100)
    }
  }
}
