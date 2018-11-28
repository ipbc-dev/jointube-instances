import * as Bluebird from 'bluebird'
import * as request from 'request'
import * as express from 'express'
import * as retry from 'retry'
import * as dns from 'dns'
import { ResultList } from '../../PeerTube/shared/models'

function badRequest (req: express.Request, res: express.Response, next: express.NextFunction) {
  return res.type('json').status(400).end()
}

function faultTolerantResolve (
  address: string,
  rrtype: 'A' | 'AAAA'
): Bluebird<boolean> {
  return new Bluebird<boolean>((res, _) => {
    _faultTolerantResolve(address, rrtype, (err, addresses) => err ? res(false) : res(true))
  })
}

function _faultTolerantResolve (address, rrtype, cb) {
  const operation = retry.operation({
    retries: 3,
    factor: 3,
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true
  })

  operation.attempt(function (currentAttempt) {
    dns.resolve(address, rrtype, function (err, addresses) {
      if (operation.retry(err)) {
        return
      }

      cb(err ? operation.mainError() : null, addresses)
    })
  })
}

interface FormattableToJSON {
  toFormattedJSON ()
}

function getFormattedObjects<U, T extends FormattableToJSON> (objects: T[], objectsTotal: number) {
  const formattedObjects: U[] = []

  objects.forEach(object => {
    formattedObjects.push(object.toFormattedJSON())
  })

  const res: ResultList<U> = {
    total: objectsTotal,
    data: formattedObjects
  }

  return res
}

// ---------------------------------------------------------------------------

export {
  badRequest,
  faultTolerantResolve,
  getFormattedObjects
}
