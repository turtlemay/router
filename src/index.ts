const middlewares = new Set<IMiddleware>()
const matchedMiddlewares = new Set<IMiddleware>()
const unmatchedMiddlewares = new Set<IMiddleware>()

/** Register middleware functions and/or route handlers. */
export function use(
  arg: RegExp | IMatchCallback,
  ...args: Array<IMatchCallback>
) {
  let regExp: RegExp | undefined
  let callbacks: Array<IMatchCallback>

  if (arg instanceof RegExp) {
    regExp = arg
    callbacks = args
  } else if (arg instanceof Function) {
    callbacks = [arg, ...args]
  } else {
    callbacks = []
  }

  middlewares.add({
    regExp: regExp || /.*/i,
    callbacks: callbacks,
    cleanupCallbacks: new Set(),
  })
}

/** Register event listeners and handle initial path. */
export function start() {
  addEventListener('popstate', handlePopState)
  render(getPath(location))
}

/** Clean up all matched routes, remove event listeners, and reset state. */
export function stop() {
  for (const v of matchedMiddlewares) {
    v.cleanupCallbacks.forEach(fn => fn())
  }
  removeEventListener('popstate', handlePopState)
  middlewares.clear()
  matchedMiddlewares.clear()
  unmatchedMiddlewares.clear()
}

/**
 * @param path The new path to navigate to, including query string.
 * Do not include the beginning hash character.
 */
export function navigate(path: string) {
  history.pushState(null, '', '#' + path)
  render(path)
}

function handlePopState(_e: PopStateEvent) {
  render(getPath(location))
}

/**
 * @param fullPath The path to process, including query string.
 * Do not include the beginning hash character.
 */
async function render(fullPath: string) {
  const [path, query] = splitPathQuery(fullPath)

  updateMiddlewares(path, matchedMiddlewares, unmatchedMiddlewares)

  for (const v of unmatchedMiddlewares) {
    v.cleanupCallbacks.forEach(fn => fn())
    v.cleanupCallbacks.clear()
  }

  for (const middleware of matchedMiddlewares) {
    const req: IRequest = {
      path: path,
      params: getReqParams(path, middleware.regExp),
      query: query,
    }
    await new Promise(async resolveSequence => {
      for (const callback of middleware.callbacks) {
        await new Promise(resolveStep => {
          const res: IResponse = {
            onLeave: (cleanupCallback: ILeaveCallback) => {
              middleware.cleanupCallbacks.add(cleanupCallback)
            },
          }
          callback(req, res, arg => {
            if (arg === 'route') {
              resolveSequence()
            } else {
              resolveStep()
            }
          })
        })
      }
      resolveSequence()
    })
  }

  /** Divide matched and unmatched middlewares. */
  function updateMiddlewares(
    path: string,
    matched: Set<IMiddleware>,
    unmatched: Set<IMiddleware>,
  ): void {
    matched.clear()
    unmatched.clear()
    for (const v of middlewares) {
      if (path.match(v.regExp)) {
        matched.add(v)
      } else {
        unmatched.add(v)
      }
    }
  }

  /** Use regex to capture parameters from a path. */
  function getReqParams(path: string, regExp: RegExp): Array<string | null> {
    const match = path.match(regExp) || []
    const results = match.slice(1, match.length)
    return results.map(v => v || null)
  }
}

/**
 * Get the requested path.
 * The hash character is omitted.
 */
function getPath(location: Location) {
  const hash = location.hash
  return hash ? hash.slice(1, hash.length) : '/'
}

/**
 * Split the query string from a path, returning both.
 * Query string will include the leading question mark.
 */
function splitPathQuery(fullPath: string): [string, string] {
  const [path, query] = fullPath.split('?', 2)
  return [path, `?${query || ''}`]
}

interface IMiddleware {
  readonly regExp: RegExp
  readonly callbacks: Array<IMatchCallback>
  readonly cleanupCallbacks: Set<ILeaveCallback>
}

export interface IRequest {
  /** The requested path. */
  readonly path: string
  /** Regex-captured parameters. */
  readonly params: Array<string | null>
  /** The post-hash query string. */
  readonly query: string
}

export interface IResponse {
  /** @param callback The function to call when we leave this route. */
  onLeave(callback: ILeaveCallback): void
}

export interface IMatchCallback {
  (req: IRequest, res: IResponse, next: INextCallback): void
}

export interface ILeaveCallback {
  (): void
}

export interface INextCallback {
  (arg: string): (void | Promise<void>)
}