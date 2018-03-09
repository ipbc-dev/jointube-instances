import * as express from 'express'

const viewsRouter = express.Router()

viewsRouter.use('/', sendIndexView)

function sendIndexView (req: express.Request, res: express.Response) {
  return res.render('index')
}

// ---------------------------------------------------------------------------

export {
  viewsRouter
}
