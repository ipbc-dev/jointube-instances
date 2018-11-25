# Application behind instances.peertu.be

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
$ node dist/server.js
```
