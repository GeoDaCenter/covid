export default function shallowCompare(newObj, prevObj) {
  for (const key in newObj) {
    if (newObj[key] !== prevObj[key]) return true;
  }
  return false;
}
