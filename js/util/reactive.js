export function reactive(obj, effective) {
  return new Proxy(obj, {
    get(obj, key) {
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      let set = Reflect.set(obj, key, value);
      effective();
      return set;
    },
  });
}
