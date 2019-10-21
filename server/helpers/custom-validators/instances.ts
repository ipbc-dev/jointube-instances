import 'express-validator'

const hostRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/

function isHostValid (host: string) {
  return host && typeof host === 'string' && !!host.match(hostRegex)
}

// ---------------------------------------------------------------------------

export {
  isHostValid
}
