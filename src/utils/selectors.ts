export const $ = function <E extends Element = Element> (
  selectors: string
) {
  return document.querySelector<E>(selectors)
}

export const $$ = function <E extends Element = Element> (
  selectors: string
) {
  return document.querySelectorAll<E>(selectors)
}