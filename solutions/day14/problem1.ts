// roll all 0's as north as possible
// get sum of row distances for each 0
//
// EXAMPLE:
// O....#....
// O.OO#....#
// .....##...
// OO.#O....O
// .O.....O#.
// O.#..O.#.#
// ..O..#O..O
// .......O..
// #....###..
// #OO..#....

function getZeros(map: string[][]) {
  const result: number[][] = [];
  map.forEach((row, y) => {
    row.forEach((col, x) => {
      if (col === 'O') result.push([y, x])
    })
  })
  return result
}

function rollNorth(map: string[][], zeros: number[][]) {
  const northMostLocations: number[][] = []
  // For each zero, go as far north as possible
  const mapCopy: string[][] = map.map(row => row.map(char => char === '#' ? '#' : '.'))
  zeros.forEach(zeroLocation => {
    const [y, x] = zeroLocation;
    console.log('line: ', y, 'row: ', x)
    // console.log('CHECKING', zeroLocation)

    for (let i = y; i >= 0; i--) {
      // already at northern most point
      if (map[i - 1] === undefined) {
        console.log('ADDING TO ROW 0')
        northMostLocations.push([0, x])
        mapCopy[0][x] = 'O'
        break;
      }
      // If position is already in result, insert with y - 1
      const northLocations = northMostLocations.map(arr => JSON.stringify(arr))
      if (northLocations.includes(JSON.stringify([i - 1, x]))) {
        console.log('STACKING BELOW EXISTING MOVEMENT')
        northMostLocations.push([i, x])
        mapCopy[i][x] = 'O'
        break;
      }
      // if ('O#'.includes(map[i - 1][x])) {
      if ('O#'.includes(mapCopy[i - 1][x])) {
        console.log('FOUND A BLOCKER')
        northMostLocations.push([i, x])
        mapCopy[i][x] = 'O'
        break;
      }
    }
    mapCopy.forEach(line => console.log(line.join('')))
  })
  console.log('LENGTHS MATCH')
  console.log(zeros.length)
  console.log(northMostLocations.length === zeros.length)
  // return northMostLocations
  return mapCopy
}

function printCopy(map: string[][], finalLocations: number[][]) {
  const blank = map.map(row => row.map(char => char === '#' ? '#' : '.'))
  // console.log(blank)
  finalLocations.forEach(coor => {
    const [y, x] = coor;
    // @ts-ignore
    blank[y][x] = '0'
  })
  blank.forEach(line => console.log(line.join('')))
  return blank;
}

function sumZeroLocations(map: string[][]) {
  console.log('OG MAP LENGTH', map.length)
  const reverse = map.reverse();
  let total = 0;
  reverse.forEach(line => console.log(line.join('')))
  reverse.forEach((line, i) => {
    let zeroCount = 0;
    line.forEach(char => char === 'O' ? zeroCount++ : null)
    console.log('ZERO COUNT FOR ROW', i)
    console.log(zeroCount)
    total += zeroCount * (i + 1)
  })
  return total
}

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
console.log(fileContent)
const maps = fileContent.split(/\n\n/)
// console.log(maps)
maps.forEach(lines => {
  // const map = lines.split(/\n/).map(str => str.split(''))
  const map = lines.split(/\n/).filter(line => line).map(str => str.split(''))
  const zeroLocations = getZeros(map);
  // console.log('zero locations')
  // console.log(zeroLocations)
  const newMap = rollNorth(map, zeroLocations)
  console.log('FINAL LOCATIONS')
  newMap.map(line => console.log(line.join('')))
  const sum = sumZeroLocations(newMap)
  console.log(sum)
  // finalLocations.forEach(loc => console.log(loc))
  // printCopy(map, finalLocations)
  // PRINT MAP
  // finalLocations.forEach((loc, i) => {
  //   const [y, x] = loc
  //   map[y][x] = 'O'
  //   // if (y !== oldY && x !== oldX) {
  //   //   map[oldY][oldX] = '?'
  //   // }
  // })
  // console.log('NEW MAP')
  // map.forEach(line => {
  //   console.log(line.join(''))
  // })
})

// get the position of every zero
// When we find a zero, 
// find the index of the first # above it
// But if there are multiple zeros in the same column


