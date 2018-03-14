import { isTestInstance } from './server/helpers/core-utils'
if (isTestInstance()) {
  require('source-map-support').install()
}

import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as cors from 'cors'
import * as morgan from 'morgan'
import { join } from 'path'
import { apiRouter } from './server/controllers/api'
import { logger } from './server/helpers/logger'
import { API_VERSION, CONFIG } from './server/initializers/constants'
// Initialize database and models
import { initDatabaseModels, sequelizeTypescript } from './server/initializers/database'
import { RequestsScheduler } from './server/lib/requests-scheduler'

const app = express()


initDatabaseModels(false)
  .then(() => onDatabaseInitDone())

app.use(morgan('combined', {
  stream: { write: logger.info.bind(logger) }
}))

app.use(bodyParser.json({
  type: [ 'application/json', 'application/*+json' ],
  limit: '500kb'
}))
app.use(bodyParser.urlencoded({ extended: false }))

// ----------- Views, routes and static files -----------

app.use(cors())

const apiRoute = '/api/' + API_VERSION
app.use(apiRoute, apiRouter)

// Static client files
app.use('/js/', express.static(join(__dirname, '../client/dist/js')))
app.use('/css/', express.static(join(__dirname, '../client/dist/css')))

app.use('/*', function (req, res) {
  return res.sendFile(join(__dirname, '../client/dist/index.html'))
})

// ----------- Errors -----------

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err['status'] = 404
  next(err)
})

app.use(function (err, req, res, next) {
  let error = 'Unknown error.'
  if (err) {
    error = err.stack || err.message || err
  }

  logger.error('Error in controller.', { error })
  return res.status(err.status || 500).end()
})

// ----------- Run -----------

function onDatabaseInitDone () {
  const port = CONFIG.LISTEN.PORT

  sequelizeTypescript.sync()
    .then(() => {
      // ----------- Make the server listening -----------
      app.listen(port, () => {
        logger.info('Server listening on port %d', port)

        RequestsScheduler.Instance.enable()
      })
    })
}
