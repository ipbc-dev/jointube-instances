import * as express from 'express'
import { body, param, query } from 'express-validator/check'
import { isHostValid } from '../../helpers/custom-validators/instances'
import { logger } from '../../helpers/logger'
import { InstanceModel } from '../../models/instance'
import { areValidationErrors } from './utils'

const instancesListValidator = [
  query('signup').optional().isBoolean().withMessage('Should have a valid signup filter'),
  query('healthy').optional().isBoolean().withMessage('Should have a valid healthy filter'),

  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.debug('Checking instances list parameters', { parameters: req.params })

    if (areValidationErrors(req, res)) return
    return next()
  }
]

const instancesAddValidator = [
  body('host').custom(isHostValid).withMessage('Should have a valid host'),

  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.debug('Checking instances add parameters', { parameters: req.body })

    if (areValidationErrors(req, res)) return

    const instance = await InstanceModel.loadByHost(req.body.host)

    if (instance) {
      return res
        .status(409)
        .json({
          error: `Instance ${req.body.host} was already added.`
        })
        .end()
    }

    return next()
  }
]

const instancesRemoveValidator = [
  param('host').custom(isHostValid).withMessage('Should have a valid host'),

  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.debug('Checking instances remove parameters', { parameters: req.params })

    if (areValidationErrors(req, res)) return

    const instance = await InstanceModel.loadByHost(req.params.host)

    if (!instance) {
      return res
        .status(404)
        .json({
          error: `Instance ${req.params.host} not found.`
        })
        .end()
    }

    res.locals.instance = instance
    return next()
  }
]

// ---------------------------------------------------------------------------

export {
  instancesAddValidator,
  instancesRemoveValidator,
  instancesListValidator
}
