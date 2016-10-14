### Installation

```bash
npm install @turtlemay/router
```

### Usage

Import or require the module:

```javascript
// import * as router from '@turtlemay/router';
const router = require('@turtlemay/router');
```

Start the router, passing a config containing your route definitions:

```javascript
router.start({
  routes: [
    {
      // Define your route using a regex.
      // Use capture groups for parameters.
      // We begin with a hash mark and define one capture group.
      regExp: /#\/foo\/(.+)/i,

      // Define a route match callback.
      // Your capture groups are passed as function arguments.
      onMatched: myArg1 => {
        console.log(`Matched route #/foo/${myArg1}.`);
        // Update your app state.
      },

      // You can also define a callback for when the route was not matched.
      onNotMatched: () => {
        console.log('Route #/foo not matched.');
        // Update your app state.
      },
    },
  ],
});
```

Navigate to a route:

```javascript
router.navigate('#/foo/bar');
```
