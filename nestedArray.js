let array = [
  [1,2,3,4],
  [5,6,7,8],
  [9,10,11,12,13,14,16],
]

// const totalNumber = array.reduce((accum, currentValue) => {
//   return Number(accum) + Number(currentValue.length)
// }, 0)

// let counter = 0;
// for (let value of array) {
//   for(let i in value) {

//     counter++;
//     if(counter === totalNumber) {
//       console.log(counter)
//     }
//   }
// }

const obj = {
  A: 2,
  B: 4,
  C: 6,
}

const obj2 = {
  D: 8,
  E: 10,
}

let newObj = {...obj, ...obj2, julius: 'tameem'}

const obj3 = {
  obj, obj2
}

console.log(obj3)

let flatArr = [];
for (let arr of array) {
  flatArr = [...flatArr, ...arr]
}

