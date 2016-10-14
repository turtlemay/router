let config: IConfig;
let isStarted = false;

export interface IRoute {
  regExp: RegExp;
  onMatched?(...params: string[]): void;
  onNotMatched?(): void;
}

export interface IConfig {
  routes: IRoute[];
}

/** Set config and register event listeners. */
export function start(newConfig: IConfig) {
  config = newConfig;
  processRoute(getURLRoutePath());
  if (isStarted) stop();
  addEventListener('popstate', handlePopState);
  isStarted = true;
}

/** Unregister event listeners. */
export function stop() {
  if (!isStarted) return;
  removeEventListener('popstate', handlePopState);
  isStarted = false;
}

/** Navigate to a new path. */
export function navigate(path: string) {
  history.pushState(null, '', removeStartAndEndSlashes(path));
  processRoute(getURLRoutePath());
}

function getURLRoutePath() {
  return removeStartAndEndSlashes(location.hash).replace(/\?.*/, '');
}

function processRoute(routePath: string) {
  for (const route of config.routes) {
    const match = routePath.match(route.regExp);
    if (match && route.onMatched) {
      match.shift();
      route.onMatched.apply(null, match);
      return;
    }
    if (route.onNotMatched) route.onNotMatched();
  }
}

function removeStartAndEndSlashes(str: string) {
  return str.replace(/^\/+|\/+$/g, '');
}

function handlePopState() {
  processRoute(getURLRoutePath());
}
