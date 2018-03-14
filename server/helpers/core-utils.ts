function isTestInstance () {
  return process.env.NODE_ENV === 'test'
}


// ---------------------------------------------------------------------------

export {
  isTestInstance
}
