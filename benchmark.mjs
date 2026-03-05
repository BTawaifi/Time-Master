const N = 10000;
const expandedArray = Array.from({length: N/2}, (_, i) => i * 2);
const expandedSet = new Set(expandedArray);
const logs = Array.from({length: N}, (_, i) => ({id: i}));

const startArray = performance.now();
for (let i = 0; i < 100; i++) {
  logs.forEach(log => expandedArray.includes(log.id));
}
const endArray = performance.now();
console.log(`Array includes: ${endArray - startArray}ms`);

const startSet = performance.now();
for (let i = 0; i < 100; i++) {
  logs.forEach(log => expandedSet.has(log.id));
}
const endSet = performance.now();
console.log(`Set has: ${endSet - startSet}ms`);
