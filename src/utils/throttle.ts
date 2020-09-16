export function throttle<T> (fn: Function) {
  let busy = false
  return function (this: T) {
    if (!busy) {
      busy = true
      fn.apply(this, arguments)
      requestAnimationFrame(() => (busy = false))
    }
  };
}
