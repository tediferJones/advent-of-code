// expand initial data and get all locations
// Get all unique pairs
// Get shortest distance between each pair
// ANSWER = sum of all distances

function getEmptyIndices(map: string[][]) {
  // look for empty rows/cols, 
  // If you find an empty row, add an empty row
  const emptyRows: number[] = [];
  const emptyCols: number[] = [];
  
  // GET EMPTY ROWS
  map.forEach((row, i) => {
    if (!row.includes('#')) {
      emptyRows.push(i)
    }
  })

  // GET EMPTY COLUMNS
  for (let i = 0; i < map[0].length; i++) {
    let isEmpty = true;
    for (const row of map) {
      if (row[i] === '#') {
        isEmpty = false
        break;
      }
    }
    if (isEmpty) emptyCols.push(i)
  }
  // console.log(emptyRows, emptyCols)
  return {
    rows: emptyRows,
    cols: emptyCols,
  }
}

function getLocations(map: string[][]) {
  const result: number[][] = []
  map.forEach((line, row) => {
    line.forEach((char, col) => {
      if (char === '#') result.push([row, col])
    })
  });
  return result;
}

function getUnqPairs(locations: number[][]) {
  const pairs: number[][][] = [];
  for (let i = 0; i < locations.length - 1; i++) {
    for(let j = i + 1; j < locations.length; j++) {
      pairs.push([locations[i], locations[j]])
    }
  }
  return pairs
}

function getShortestPath(a: number[], b: number[], empties: { rows: number[], cols: number[] }) {
  // Recursive function that goes in every direction
  // But cancels if the next node is further from B than the current node
  const expansionFactor = 1000000;
  // const expansionFactor = 100;
  // WORKING
  // const dy = a[0] > b[0] ? a[0] - b[0] : b[0] - a[0];
  // const dx = a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
  // return dx + dy;

  const ay = a[0]
  const ax = a[1]
  const by = b[0]
  const bx = b[1]
  const [yMin, yMax] = ay < by ? [ay, by] : [by, ay]
  const [xMin, xMax] = ax < bx ? [ax, bx] : [bx, ax]
  let emptyCounter = 0
  empties.rows.forEach(i => {
    if (yMin < i && i < yMax) {
      // console.log('CROSSING EMPTY ROW')
      emptyCounter++
    }
  })
  empties.cols.forEach(i => {
    if (xMin < i && i < xMax) {
      // console.log('CROSSING EMPTY COL')
      emptyCounter++
    }
  })
  // console.log('crosses ', emptyCounter, ' empty lines')
  // console.log(yMax, yMin, xMax, xMin)
  // console.log('WITHOUT EXPANSION')
  // console.log(yMax-yMin + xMax-xMin)
  // const dy = a[0] > b[0] ? a[0] - b[0] : b[0] - a[0];
  // const dx = a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
  // console.log(a, b)
  // console.log(dy, dx)
  // console.log('SHORTEST DISTANCE', dy + dx)
  // console.log('WITH EXPANSION')
  // YOU ARE COUNTING EMPTY ROWS TWICE
  // Figure out distance with empty spaces
  // Then add factor * emptySpaces
  return (yMax - yMin) + (xMax - xMin) - emptyCounter + (emptyCounter*expansionFactor)
}

function ppm(map: string[][]) {
  for (const line of map) {
    console.log(line.join(''))
  }
}

// const fileContent = await Bun.file('example.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
const map = fileContent
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''));

const emptyIndices = getEmptyIndices(map)
const locations = getLocations(map);
console.log('got locations')
const unqPairs = getUnqPairs(locations);
console.log('got unique pairs')
let total = 0;
console.log('Summing all distances')
unqPairs.forEach(pair => {
  total += getShortestPath(pair[0], pair[1], emptyIndices)
})
console.log("TRUE ANSWER")
console.log(total)

// Time to clean up and make it functional

// console.log('TESTING')
// console.log(map[0][3])
// console.log(map[2][0])
// console.log(getShortestPath(
//   [0,3], [2,0], emptyIndices
// ))

// keep track of every empty row/col indexes
// figure out how many empty rows/cols exist between those points
// if it crosses 2 rows and 3 cols, 
// we can just add 2*Factor to dy and 3*factor to dx


// ppm(lines)
// // console.log(lines)
// 
// const locations = getLocations(lines)
// expandMap(lines)
// ppm(lines)
// console.log(locations)

// ANSWER: 827009909817

