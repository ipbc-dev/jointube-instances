import * as Bluebird from 'bluebird'
import * as request from 'request'

function doRequest (
  requestOptions: request.CoreOptions & request.UriOptions
): Bluebird<{ response: request.RequestResponse, body: any }> {
  return new Bluebird<{ response: request.RequestResponse, body: any }>((res, rej) => {
    request(requestOptions, (err, response, body) => err ? rej(err) : res({ response, body }))
  })
}

export {
  doRequest
}
