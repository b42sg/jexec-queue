# How To Run

Server uses on MongoDB
the easiest way to run it

```
docker run -d -p 27017:27017 --name=mongo mongo
```

to run server you should exec

```
npm start
```

or

```
npm install

LOG=true \
DEBUG=jexec-manager*
SERVER_HOST=localhost \
SERVER_PORT=8088 \
CORS_ORIGIN=http://localhost:3000 \
MONGO_URL=mongodb://localhost:27017/jexec \
QUEUE_STUCK_JOBS_TIMEOUT=120000 \
QUEUE_STUCK_CLEANER_INTERVAL=120000 \
    npm start
```

**LOG** - enable/disable http requests logging (optional)

**DEBUG** - see [debug](https://www.npmjs.com/package/debug) (optional)

**CORS_ORIGIN** - enable cors for this address

**QUEUE_STUCK_JOBS_TIMEOUT** - "processing" jobs which started more then QUEUE_STUCK_CLEANER_INTERVAL ago will be failed

**QUEUE_STUCK_CLEANER_INTERVAL** - how often will cleaner be run

warning - QUEUE_STUCK_JOBS_TIMEOUT should be approximately > then average job execution time

# API Docs

see http://petstore.swagger.io/?url=https://raw.githubusercontent.com/b42sg/jexec-queue/master/packages/jexec-manager/swagger.json

### add jobs

```
for i in {1..15}; do http post localhost:8088/jobs value=$i &; done
```