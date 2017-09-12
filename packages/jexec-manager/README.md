```
for i in {1..15}; do http post localhost:8088/jobs value=$i &; done
```