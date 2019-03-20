import * as Bluebird from 'bluebird'
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
): Bluebird<[]> {
  return new Bluebird<[]>(res => {
    _faultTolerantResolve(address, rrtype, (err, addresses) => err ? res([]) : res(addresses))
  })
}

function _faultTolerantResolve (address, rrtype, cb) {
  const operation = retry.operation({
    retries: 1,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 10 * 1000,
    randomize: false
  })

  operation.attempt(() => {
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
