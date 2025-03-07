function getArea(coors: number[][]) {
  const length = coors.length;
  let area = 0;

  for (let i = 0; i < length; i++) {
    const j = (i + 1) % length;
    area += coors[i][0] * coors[j][1]
    area -= coors[j][0] * coors[i][1]
  }

  area = Math.abs(area) / 2;
  return area
}

interface MinMax {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
}

const dirs: { [key: string]: number[] } = {
  U: [-1, 0],
  D: [1, 0],
  R: [0, 1],
  L: [0, -1]
}

function getAreaV2(coors: number[][], pos: number[], minMax: MinMax) {
  // TESTING
  const [y, x] = pos;
  const { minX, maxX, minY, maxY } = minMax;
  if ((x < minX || x > maxX) || (y < minY || y > maxY)) {
    console.log('THIS IS OUTSIDE OF THE SHAPE')
    return 0
  }

  const alreadySeen: string[] = [];
  const queue = [pos];
  const perimeter = coors.map(pair => JSON.stringify(pair));
  let area = 0;
  while (queue.length > 0) {
    // console.log('RUNNING')
    const item = queue.shift();
    if (!item) return area;
    // const str = JSON.stringify(item)
    // if (alreadySeen.includes(str)) {
    //   // console.log('SEEN IT')
    //   continue
    // }
    // alreadySeen.push(str)
    // if (perimeter.includes(str)) { // || alreadySeen.includes(str)) {
    //   // console.log('FOUND PERIMETER')
    //   continue
    // }
    area++
    for (const key in dirs) {
      const [dy, dx] = dirs[key];
      const [y, x] = item;
      const newPair = [y + dy, x + dx];
      const strPair = JSON.stringify(newPair)
      if (alreadySeen.includes(strPair)) {
        continue
      }
      if (perimeter.includes(strPair)) {
        continue
      }
      queue.push(newPair)
    }
    
  }
  // console.log(area)
  return area
}

// function fillArea(coors: number[][]) {
//   // WE ALWAYS START AT 0,0
//   // ONLY HAVE TO TEST 4 directions, one of them should be inside the wall
//   // CHECK THE CORNERS, NOT DIRECTLY ABOVE OR BELOW
//   [
//     // [-1, -1],
//     // [-1, 1],
//     // [1, -1],
//     [1, 1],
//   ].forEach(start => {
//       getAreaV2(coors, start)
//     })
// }

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const lines = fileContent.split(/\n/).filter(line => line)

const positions: number[][] = [
  [0, 0]
];

lines.forEach(line => {
  const [dir, count, color] = line.split(/\s+/)
  const stepCount = Number(count)
  const [dy, dx] = dirs[dir];
  const [prevY, prevX] = positions[positions.length - 1]
  for (let i = 1; i <= stepCount; i++) {
    const newPos = [prevY + (dy * i), prevX + (dx * i)]
    positions.push(newPos)
  }
})

// Last position is a duplicate of start
positions.splice(positions.length - 1)
console.log(positions)
console.log(positions.length)

let minMax = {
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
}
positions.forEach(pos => {
  const [y, x] = pos;
  if (y < minMax.minY) {
    minMax.minY = y;
  }
  if (y > minMax.maxY) {
    minMax.maxY = y;
  }
  if (x < minMax.minX) {
    minMax.minX = x;
  }
  if (x > minMax.maxX) {
    minMax.maxX = x;
  }
})
console.log(minMax)

let insideSize = 0;
[
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
].some(pair => {
  console.log('CHECKING KEY')
  insideSize = getAreaV2(positions, pair, minMax)
  console.log(insideSize)
  return insideSize
})
console.log(insideSize)
console.log(positions.length)
console.log('ANSWER', insideSize + positions.length)
// console.log(getArea(positions))

// let highestY = 0;
// let highestX = 0;
// positions.forEach(pos => {
//   const [y, x] = pos;
//   if (y > highestY) highestY = y
//   if (x > highestX) highestX = x
// })
// console.log(highestY, highestX)

// const testMap = [...Array(highestY + 1).keys()].map(i => {
//   return [...Array(highestX + 1).keys()].map(j => {
//     return '.'
//   })
// })
// 
// positions.forEach(pos => {
//   const [y, x] = pos;
//   // console.log(y,x)
//   testMap[y][x] = '#'
// })
// 
// // console.log(testMap)
// for (const line of testMap) {
//   console.log(line)
// }

// const areaCounter: { [key: string]: number[] } = {};
// positions.slice(0, positions.length - 1).forEach(pos => {
//   const [y, x] = pos;
//   if (areaCounter[y]) {
//     areaCounter[y].push(x)
//   } else {
//     areaCounter[y] = [x]
//   }
// })
// let total = 0;
// Object.keys(areaCounter).forEach(key => {
//   areaCounter[key] = areaCounter[key].sort()
//   // console.log(areaCounter[key][areaCounter[key].length - 1] - areaCounter[key][0])
//   // total += areaCounter[key][areaCounter[key].length - 1] - areaCounter[key][0] + 1
//   total += Math.abs(areaCounter[key][areaCounter[key].length - 1] - areaCounter[key][0] + 1)
// })
// console.log(areaCounter)
// console.log(total)

// TOO LOW
// 16803
