export const shallowEqual = (object1, object2) => {
  // Thanks @Dmitri Pavlutin
  const keys = Object.keys(object1);
  if (keys.length !== Object.keys(object2).length) return false;
  for (let i = 0; i < keys.length; i++) {
    if (object1[keys[i]] !== object2[keys[i]]) {
      if (keys[i] !== 'false' && keys[i] !== 'nIndex' && keys[i] !== 'dIndex')
        return false;
    }
  }
  return true;
};
