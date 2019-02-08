import { AllowNull, Column, CreatedAt, DataType, Default, Is, IsInt, Max, Model, Sequelize, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerConfig } from '../../PeerTube/shared/models'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceConnectivityStats } from 'shared/models/instance-connectivity-stats.model'
import { Instance } from '../../shared/models/instance.model'
import { isHostValid } from '../helpers/custom-validators/instances'
import { logger } from '../helpers/logger'
import { INSTANCE_SCORE } from '../initializers/constants'
import { getSort, throwIfNotValid } from './utils'
import * as sequelize from 'sequelize'

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
  connectivityStats: InstanceConnectivityStats

  @AllowNull(false)
  @Column(DataType.JSONB)
  config: ServerConfig

  @AllowNull(false)
  @Default(false)
  @Column
  blacklisted: boolean

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

  static listForApi (start: number, count: number, sort: string, filters: { signup?: string, healthy?: string, nsfwPolicy?: string[] }) {
    const query = {
      offset: start,
      limit: count,
      order: InstanceModel.getSort(sort),
      where: {
        blacklisted: false
      }
    }

    if (filters.signup !== undefined) {
      Object.assign(query.where, {
        config: {
          signup: {
            allowed: filters.signup === 'true'
          }
        }
      })
    }

    if (filters.healthy !== undefined) {
      const symbol = filters.healthy === 'true' ? Sequelize.Op.gte : Sequelize.Op.lt
      Object.assign(query.where, {
        score: {
          [symbol]: INSTANCE_SCORE.HEALTHY_AT
        }
      })
    }

    if (filters.nsfwPolicy !== undefined) {
      Object.assign(query.where, {
        config: {
          instance: {
            defaultNSFWPolicy: {
              [Sequelize.Op.any]: filters.nsfwPolicy
            }
          }
        }
      })
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

  static updateConfigAndStats (id: number, config: any, stats: any, connectivityStats: any) {
    const options = {
      where: { id }
    }

    return InstanceModel.update({
      config,
      stats,
      connectivityStats
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

  static async getStats () {
    const query = 'SELECT ' +
      'COUNT(*) as "totalInstances", ' +
      'SUM((stats->>\'totalUsers\')::integer) as "totalUsers", ' +
      'SUM((stats->>\'totalLocalVideos\')::integer) as "totalVideos", ' +
      'SUM((stats->>\'totalLocalVideoComments\')::integer) as "totalVideoComments", ' +
      'SUM((stats->>\'totalLocalVideoViews\')::integer) as "totalVideoViews", ' +
      'SUM((stats->>\'totalLocalVideoFilesSize\')::bigint) as "totalVideoFilesSize" ' +
      'FROM "instance" ' +
      'WHERE blacklisted = false'

    return InstanceModel.sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(([ res ]) => res)
      .then(res => ({
        totalInstances: res.totalInstances,
        totalUsers: res.totalUsers,
        totalVideos: res.totalVideos,
        totalVideoComments: res.totalVideoComments,
        totalVideoViews: res.totalVideoViews,
        totalVideoFilesSize: res.totalVideoFilesSize
      }))
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
    let userVideoQuota: number
    if (this.config.user) userVideoQuota = this.config.user.videoQuota

    return {
      id: this.id,
      host: this.host,

      // config
      name: this.config.instance.name,
      shortDescription: this.config.instance.shortDescription,
      version: this.config.serverVersion,
      signupAllowed: this.config.signup.allowed,
      userVideoQuota,

      // stats
      totalUsers: this.stats.totalUsers,
      totalVideos: this.stats.totalVideos,
      totalLocalVideos: this.stats.totalLocalVideos,
      totalInstanceFollowers: this.stats.totalInstanceFollowers,
      totalInstanceFollowing: this.stats.totalInstanceFollowing,

      // connectivity
      supportsIPv6: this.connectivityStats ? this.connectivityStats.supportsIPv6 : undefined,

      // computed stats
      health: Math.round((this.score / INSTANCE_SCORE.MAX) * 100)
    }
  }
}
