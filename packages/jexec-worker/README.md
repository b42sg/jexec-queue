# How To Run

```
npm install

GRID_URL=http://localhost:8088 ./jexec-worker.js
```

or

```
DELAY=50000 GRID_URL=http://localhost:8088 DEBUG=jexec-worker* ./jexec-worker.js ./task.js
```

*DELAY* - completes in DELAY

*GRID_URL* - http url of manager (jexec-manager)

*DEBUG* - see [debug](https://www.npmjs.com/package/debug)

*./task.js* - job executor (defaults to `./task.js`)