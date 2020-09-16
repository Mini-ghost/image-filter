export const hasOwn = function (obj: {}, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}