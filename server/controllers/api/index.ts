import * as express from 'express'
import { badRequest } from '@peertube/server/helpers/utils'
import { instancesRouter } from './instances'

const apiRouter = express.Router()

apiRouter.use('/instances', instancesRouter)
apiRouter.use('/*', badRequest)

// ---------------------------------------------------------------------------

export { apiRouter }
