// expand initial data and get all locations
// Get all unique pairs
// Get shortest distance between each pair
// ANSWER = sum of all distances

function expandMap(map: string[][]) {
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
  console.log(emptyRows, emptyCols)

  emptyRows.forEach((i, count) => {
    map.splice(i + count, 0, Array(map[0].length).fill('.'))
  })

  emptyCols.forEach((i, count) => {
    map.forEach(row => {
      row.splice(i + count, 0, '.')
    })
  })
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

function getShortestPath(a: number[], b: number[]) {
  // Recursive function that goes in every direction
  // But cancels if the next node is further from B than the current node
  const dy = a[0] > b[0] ? a[0] - b[0] : b[0] - a[0];
  const dx = a[1] > b[1] ? a[1] - b[1] : b[1] - a[1];
  console.log('SHORTEST PATH')
  console.log(dx + dy)
  return dx + dy;
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

ppm(map)
const formattedMap = expandMap(map);
ppm(map)
const locations = getLocations(map);
console.log(locations)
const unqPairs = getUnqPairs(locations);
// console.log(unqPairs)
let total = 0;
console.log(unqPairs.length)
unqPairs.forEach(pair => {
  total += getShortestPath(pair[0], pair[1])
})
console.log(total)


// ppm(lines)
// // console.log(lines)
// 
// const locations = getLocations(lines)
// expandMap(lines)
// ppm(lines)
// console.log(locations)

// ANSWER: 9563821
