# How To Run

walk through `packages/` and run each app separately (see instructions)

# Arch

**jexec-manager** - manages state (stored in mongo) and serves an API

**jexec-worker** - executes tasks, connects to manager

**jexec-webapp** - UI, uses manager's API

# RFE

* pagnination is implemented on UI side
* workers can become "zombie" - reconnection and auto-killing should get implemented
* there are no indicies set in mongo
* "clean stuck jobs" algo is pretty weak and should be properly implemented
* socket is not protected (f.e by an api key)
* manager is not scaleable
* there should be some protection against worker contentions
