import * as express from 'express'
import 'express-validator'

function setDefaultSort (req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.query.sort) req.query.sort = '-createdAt'

  return next()
}

// ---------------------------------------------------------------------------

export {
  setDefaultSort
}
