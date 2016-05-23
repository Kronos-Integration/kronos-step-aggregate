index
=====

![data flow](overview.png)


```json
"my-aggregate-step": {
  "type": "kronos-aggregate",
  "aggregate": "by-endpoint-name",
  "endpoints": {
    "in": {
      "in": true,
      "opposite": true
    },
    "state": {
      "out": true,
      "opposite": true,
      "target": "health-check:state"
    },
    "memory": {
      "out": true,
      "opposite": true,
      "target": "health-check:memory"
    },
    "cpu": {
      "out": true,
      "opposite": true,
      "target": "health-check:cpu"
    }
  }
}
```
