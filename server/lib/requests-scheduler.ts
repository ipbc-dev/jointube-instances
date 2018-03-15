import { getConfigAndStatsInstance } from '../helpers/instance-requests'
import { SCHEDULER_INTERVAL } from '../initializers/constants'
import { InstanceModel } from '../models/instance'
import { logger } from '../helpers/logger'

export class RequestsScheduler {

  private interval: NodeJS.Timer
  private isRunning = false

  private static instance: RequestsScheduler

  private constructor () { }

  enable () {
    logger.info('Enabling request scheduler.')
    this.interval = setInterval(() => this.execute(), SCHEDULER_INTERVAL)
  }

  disable () {
    clearInterval(this.interval)
  }

  async execute () {
    // Already running?
    if (this.isRunning === true) return

    this.isRunning = true

    logger.info('Running requests scheduler.')

    const badInstances: number[] = []
    const goodInstances: number[] = []

    const instances = await InstanceModel.listHostsWithId()
    for (const instance of instances) {
      try {
        const { config, stats } = await getConfigAndStatsInstance(instance.host)
        await InstanceModel.updateConfigAndStats(instance.id, config, stats)

        goodInstances.push(instance.id)
        logger.info(`Updated ${instance.host} instance.`)
      } catch (err) {
        badInstances.push(instance.id)
        logger.warn(`Cannot update ${instance.host} instance.`, err)
      }
    }

    await InstanceModel.updateInstancesScoreAndRemoveBadOnes(goodInstances, badInstances)

    this.isRunning = false
  }

  static get Instance () {
    return this.instance || (this.instance = new this())
  }
}
