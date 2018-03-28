# Application behind instances.peertu.be

## Dev

```
$ git submodule update --init --recursive
$ yarn install --pure-lockfile
```

Then run simultaneously (for example with 3 terminals):

```
$ tsc -w
```

```
$ node dist/server
```

```
$ cd client && npm run serve
```

Then open http://localhost:8080.

## Production

In the root of the cloned repo:

```
$ git submodule update --init --recursive
$ yarn install --pure-lockfile
$ npm run build
$ node dist/server.js
```
