import * as geolite2 from 'geolite2-redist'
import * as maxmind from 'maxmind'

const bluebird = require('bluebird')
const openDb = bluebird.promisify(maxmind.open)

let _countryLookup = undefined

const initGeoip = () => {
  _countryLookup = openDb(geolite2.paths['GeoLite2-Country'], {
    cache: {
      max: 500 // Max items in cache, by default it's 6000
    }
  })
}

const countryLookup = (ip): Promise<maxmind.CountryResponse> => {
  if (_countryLookup === undefined) initGeoip()

  return _countryLookup
    .then(db => db.get(ip),
          err => console.error('Unable to open Database: ', err))
    .catch(err => console.error('Unable to check country: ', err))
}

export {
  initGeoip,
  countryLookup
}
