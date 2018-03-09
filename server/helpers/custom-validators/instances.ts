import 'express-validator'
import * as validator from 'validator'
import { isTestInstance } from '@peertube/server/helpers/core-utils'
import { exists } from '@peertube/server/helpers/custom-validators/misc'

function isHostValid (host: string) {
  const isURLOptions = {
    require_host: true,
    require_tld: true
  }

  // We validate 'localhost', so we don't have the top level domain
  if (isTestInstance()) {
    isURLOptions.require_tld = false
  }

  return exists(host) && validator.isURL(host, isURLOptions) && host.split('://').length === 1
}

// ---------------------------------------------------------------------------

export {
  isHostValid
}
