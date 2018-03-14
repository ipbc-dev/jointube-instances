import 'express-validator'
import * as validator from 'validator'
import { isTestInstance } from '../core-utils'

function isHostValid (host: string) {
  const isURLOptions = {
    require_host: true,
    require_tld: true
  }

  // We validate 'localhost', so we don't have the top level domain
  if (isTestInstance()) {
    isURLOptions.require_tld = false
  }

  return host && validator.isURL(host, isURLOptions) && host.split('://').length === 1
}

// ---------------------------------------------------------------------------

export {
  isHostValid
}
