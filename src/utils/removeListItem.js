export const removeListItem = (arr, item) => {
  const itemIdx = arr.indexOf(item);
  return [...arr.slice(0, itemIdx), ...arr.slice(itemIdx + 1)];
};
