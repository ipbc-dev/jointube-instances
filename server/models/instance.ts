import { AllowNull, Column, CreatedAt, DataType, Default, Is, IsInt, Max, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { ServerConfig } from '../../PeerTube/shared/models'
import { About } from '../../PeerTube/shared/models/server/about.model'
import { ServerStats } from '../../PeerTube/shared/models/server/server-stats.model'
import { InstanceConnectivityStats } from 'shared/models/instance-connectivity-stats.model'
import { Instance } from '../../shared/models/instance.model'
import { isHostValid } from '../helpers/custom-validators/instances'
import { logger } from '../helpers/logger'
import { INSTANCE_SCORE } from '../initializers/constants'
import { getSort, throwIfNotValid } from './utils'
import * as sequelize from 'sequelize'
import { FindAndCountOptions, literal, Op, QueryTypes, WhereOptions } from 'sequelize'
import { InstanceHost } from '../../shared/models/instance-host.model'
import { NSFWPolicyType } from '../../PeerTube/shared/models/videos/nsfw-policy.type'

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
  @Column(DataType.JSONB)
  about: About

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.INTEGER))
  categories: number[]

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.TEXT))
  languages: string[]

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

  static listForApi (options: {
    start: number,
    count: number,
    sort: string,
    signup?: string,
    healthy?: string,
    nsfwPolicy?: NSFWPolicyType[],
    minUserQuota?: number,
    search?: string,
    categoriesOr?: number[],
    languagesOr?: string[]
  }) {
    const whereAnd: WhereOptions[] = []

    const query: FindAndCountOptions = {
      offset: options.start,
      limit: options.count,
      order: InstanceModel.getSort(options.sort)
    }

    if (options.healthy !== undefined) {
      const symbol = options.healthy === 'true' ? Op.gte : Op.lt

      whereAnd.push({
        score: {
          [symbol]: INSTANCE_SCORE.HEALTHY_AT
        }
      })
    }

    if (options.signup !== undefined) {
      whereAnd.push({
        config: {
          signup: {
            allowed: options.signup === 'true'
          }
        }
      })
    }

    if (options.nsfwPolicy !== undefined) {
      whereAnd.push({
        config: {
          instance: {
            defaultNSFWPolicy: {
              [ Op.any ]: options.nsfwPolicy
            }
          }
        }
      })
    }

    if (options.search) {
      whereAnd.push({
        host: {
          [ Op.iLike ]: `%${options.search}%`
        }
      })
    }

    if (Array.isArray(options.languagesOr)) {
      whereAnd.push({
        languages: {
          [ Op.overlap ]: options.languagesOr
        }
      })
    }

    if (Array.isArray(options.categoriesOr)) {
      whereAnd.push({
        categories: {
          [ Op.overlap ]: options.categoriesOr
        }
      })
    }

    if (options.minUserQuota) {
      whereAnd.push({
        [ Op.or ]: [
          {
            config: {
              user: {
                videoQuota: {
                  [ Op.gte ]: options.minUserQuota
                }
              }
            }
          },
          {
            config: {
              user: {
                videoQuota: {
                  [ Op.eq ]: -1
                }
              }
            }
          }
        ]
      })
    }

    query.where = { [Op.and]: whereAnd }

    return InstanceModel.findAndCountAll(query)
      .then(({ rows, count }) => {
        return {
          data: rows,
          total: count
        }
      })
  }

  static listForHostsApi (start: number, count: number, sort: string, filters: { since?: string }) {
    const query = {
      attributes: [ 'host', 'createdAt' ],
      offset: start,
      limit: count,
      order: InstanceModel.getSort(sort),
      where: {
        blacklisted: false
      }
    }

    if (filters.since !== undefined) {
      Object.assign(query.where, {
        createdAt: {
          [Op.gte]: filters.since
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
      attributes: [ 'id', 'host' ],
      where: {
        blacklisted: false
      }
    }

    return InstanceModel.findAll(query)
  }

  static updateConfigAndStatsAndAbout (id: number, config: any, stats: any, about: About, connectivityStats: any) {
    const options = {
      where: { id }
    }

    const categories = about && about.instance && Array.isArray(about.instance.categories)
      ? about.instance.categories
      : []

    const languages = about && about.instance && Array.isArray(about.instance.languages)
      ? about.instance.languages
      : []

    return InstanceModel.update({
      config,
      stats,
      about,
      categories,
      languages,
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
      'WHERE blacklisted IS FALSE'

    return InstanceModel.sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
      .then(([ res ]) => res)
      .then((res: any) => ({
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
          [Op.lte]: 0
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
      type: QueryTypes.BULKUPDATE
    }

    return InstanceModel.sequelize.query(query, options)
  }

  private static getSort (sort: string) {
    const mappingColumns = {
      totalUsers: literal(`stats->'totalUsers'`),
      totalVideos: literal(`stats->'totalVideos'`),
      totalLocalVideos: literal(`stats->'totalLocalVideos'`),
      totalInstanceFollowers: literal(`stats->'totalInstanceFollowers'`),
      totalInstanceFollowing: literal(`stats->'totalInstanceFollowing'`),
      signupAllowed: literal(`config->'signup'->'allowed'`),
      name: literal(`config->'instance'->'name'`),
      version: literal(`config->'serverVersion'`),
      health: 'score',
      country: literal(`"connectivityStats"->'country'`)
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

      categories: this.categories,
      languages: this.languages,

      autoBlacklistUserVideosEnabled: this.config.autoBlacklist
        ? this.config.autoBlacklist.videos.ofUsers.enabled
        : false,

      defaultNSFWPolicy: this.config.instance.defaultNSFWPolicy,
      isNSFW: this.config.instance.isNSFW,

      // stats
      totalUsers: this.stats.totalUsers,
      totalVideos: this.stats.totalVideos,
      totalLocalVideos: this.stats.totalLocalVideos,
      totalInstanceFollowers: this.stats.totalInstanceFollowers,
      totalInstanceFollowing: this.stats.totalInstanceFollowing,

      // connectivity
      supportsIPv6: this.connectivityStats ? this.connectivityStats.supportsIPv6 : undefined,
      country: this.connectivityStats ? this.connectivityStats.country : undefined,

      // computed stats
      health: Math.round((this.score / INSTANCE_SCORE.MAX) * 100)
    }
  }

  toHostFormattedJSON (): InstanceHost {
    return {
      host: this.host
    }
  }
}
