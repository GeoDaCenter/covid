export default function resolveName(name, existingNames) {
  let resolvedName = name;

  if (existingNames.indexOf(name) !== -1) {
    let i = 1;
    while (existingNames.indexOf(resolvedName) !== -1) {
      resolvedName = `${name}_${i}`;
      i++;
    }
  }

  return resolvedName;
}
