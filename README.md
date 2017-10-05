### Installation

```
npm install @turtlemay/router
```

### Basic Usage

```javascript
import * as router from '@turtlemay/router'
```

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