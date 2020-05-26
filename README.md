# Application behind instances.jointube.net

## Dev

```terminal
$ git submodule update --init --recursive
$ yarn install --pure-lockfile
```

Initialize the database:

```terminal
$ sudo -u postgres createuser -P peertube
$ sudo -u postgres createdb -O peertube peertube_instances
```

Then run simultaneously (for example with 3 terminals):

```terminal
$ tsc -w
```

```terminal
$ node dist/server
```

```terminal
$ cd client && npm run serve
```

Then open http://localhost:8080.

## Production

In the root of the cloned repo:

```terminal
$ git submodule update --init --recursive
$ yarn install --pure-lockfile
$ npm run build
$ sudo -u postgres createuser -P peertube
$ sudo -u postgres createdb -O peertube peertube_instances
$ node dist/server.js
```

## PeerTube auto follow

If you don't want to run this application but would like to have your own index for the [PeerTube auto follow feature](https://docs.joinpeertube.org/#/admin-following-instances?id=automatically-follow-other-instances), serve the following JSON format:

```
{
  "total": 5,
  "data": [
    {
      "host": "video1.example.com"
    },
    {
      "host": "video2.example.com"
    },
    {
      "host": "video3.example.com"
    },
    {
      "host": "video4.example.com"
    },
    {
      "host": "video5.example.com"
    }
]
```
