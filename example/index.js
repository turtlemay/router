import * as router from './router/index.js'

// Pathless middleware is called for all requests:
router.use((req, res, next) => {
  console.group(`Processing path "${req.path}":`)

  // Continue to the next middleware function or matched route:
  next()
})

/*
  Use regular expressions to define routes.
  Matching begins immediately after the hash and
  before the start of the query parameter.
*/

// Matches the root (no hash, or "#/"):
router.use(/^\/$/, (req, res, next) => {
  console.assert(req.path === '/')

  // Update your app state here…

  next()
})

// Matches path "#/foo":
router.use(/^\/foo$/i, (req, res, next) => {
  console.assert(req.path === '/foo')

  // Update your app state…

  /*
    You can optionally define a callback for when we *leave* this route.
    You can use this to unregister event listeners or re-render relevant
    parts of your UI.
  */
  res.onLeave(() => {
    console.info("Cleaning up \"/foo\".")

    // Undo state changes…
  })

  next()
})

// Capture groups are passed as req.params:
router.use(/^\/(\w*)/i, (req, res, next) => {
  console.info("Captured parameters:", req.params)

  /*
    The query string after the hash is also passed as req.query.
    This can be parsed with URLSearchParams etc:
  */
  const params = new URLSearchParams(req.query)
  console.group("Captured query parameters:")
  for (const k of params.keys()) {
    console.info({ [k]: params.get(k) })
  }
  console.groupEnd()

  next()
})

// You can also define two or more functions in sequence:
router.use(
  // First function in sequence:
  (req, res, next) => {
    const exampleCondition = false

    // Continue to the next handler in this sequence:
    if (exampleCondition) {
      console.info("Moving to next function in sequence…")
      return next()
    }

    /*
      Or skip the rest of this sequence and continue to the next middleware
      or matched route:
    */
    next('route')
  },

  // Second function in sequence:
  () => {
    // This function will be skipped if next('route') was called.
    console.assert(false)
  },
)

router.use(() => {
  console.groupEnd()
})

// Register event listeners and handle our initial requested path:
router.start()