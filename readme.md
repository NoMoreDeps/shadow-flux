## Shadow Flux
Shadow Flux is an implementation of the Flux pattern in Typescript. It can be used on Typescript and Javascript projects

### Installation

```bash
  npm i -S shadow-flux
```

### Overview
Flux follows a simple unidirectional data flow pattern that can be sumurized as below :

<pre>
                            +-----------+
+--------------------------->  SERVER   |
|                           +-----+-----+
|                                 |
|                                 |
|     +------------+        +-----v-----+       +------------+
|     |    VIEW    +------->+   ACTION  +-------> DISPATCHER |
|     +-----^------+        +-----------+       +-----+------+
|           |                                         |
|           |                                         |
|           |               +------------+            |
|           +---------------+   STORE    <------------+
|                           +-----+------+
|                                 |
+---------------------------------+
</pre>

* An action is triggered from a view or from a server
* The action is stacked in the dispatcher
* The dispatcher dispatches one action at a time
* Any store can handle the action
* Any store can wait for another store to finish before processing the action