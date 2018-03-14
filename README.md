# Application behind instances.peertu.be

In the root of the cloned repo:

```
$ git submodule update --init --recursive
$ yarn install --pure-lockfile
$ npm run build
$ node dist/server.js
```
