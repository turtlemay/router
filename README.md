### Installation

Import as a native browser module:

```javascript
import * as router from 'https://cdn.jsdelivr.net/npm/@turtlemay/router'
```

Or use the package in your module bundler of choice:

```
npm i -D @turtlemay/router
```

```javascript
import * as router from '@turtlemay/router'
```

### Basic Usage

Define routes and middleware:

```javascript
// Define routes using regex.
router.use(/^\/$/, (req, res, next) => {
  console.assert(req.path === '/')
  next()
})
```

Start event listeners and handle the initial route:

```javascript
router.start()
```

Request a path:

```javascript
router.navigate('/foo')
```

See [example](./example) for complete usage.