import * as express from 'express'
import { asyncMiddleware } from '../middlewares/async'
import { InstanceModel } from '../models/instance'
import { CONFIG } from '../initializers/constants'
import { Feed } from 'feed'

const feedsRouter = express.Router()

feedsRouter.get('/atom/instances', asyncMiddleware(generateInstancesFeed))

// ---------------------------------------------------------------------------

export { feedsRouter }

// ---------------------------------------------------------------------------

async function generateInstancesFeed (req: express.Request, res: express.Response) {
  const resultList = await InstanceModel.listForApi({
    start: 0,
    count: 20,
    sort: '-createdAt'
  })

  const feed = new Feed({
    title: 'PeerTube instances',
    description: 'Instances feed',
    id: CONFIG.WEBSERVER.URL,
    link: CONFIG.WEBSERVER.URL,
    favicon: CONFIG.WEBSERVER.URL + '/client/favicon.png',
    copyright: '',
    generator: `Toraifōsu`, // ^.~
    feedLinks: {
      atom: `${CONFIG.WEBSERVER.URL}/feeds/instances/atom`
    }
  })

  resultList.data.forEach(instanceModel => {
    const instance = instanceModel.toFormattedJSON()

    feed.addItem({
      title: instance.name,
      id: instance.host,
      link: `https://${instance.host}`,
      content: instance.shortDescription,
      date: instanceModel.createdAt
    })
  })

  res.set('Content-Type', 'application/atom+xml')
  return res.send(feed.atom1()).end()
}
