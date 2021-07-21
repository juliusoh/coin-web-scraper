let obj = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
}

// array of keys
// array of values .values
const hi = Object.values(obj).reduce((acc, curr) => {
  return acc + curr
})
// 1 + undefined ?
// 2 + 1 = 3
// 3 + 3 = 6
// 4 + 6 = 10 ?

console.log(hi);

