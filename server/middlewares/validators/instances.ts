import * as express from 'express'
import { body, param } from 'express-validator/check'
import { isHostValid } from '../../helpers/custom-validators/instances'
import { logger } from '../../helpers/logger'
import { InstanceModel } from '../../models/instance'
import { areValidationErrors } from '@peertube/server/middlewares/validators/utils'

const instancesAddValidator = [
  body('host').custom(isHostValid).withMessage('Should have a valid host'),

  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.debug('Checking instances add parameters', { parameters: req.body })

    if (areValidationErrors(req, res)) return

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
  instancesRemoveValidator
}
