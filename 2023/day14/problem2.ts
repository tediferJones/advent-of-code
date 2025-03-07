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
  return map.map((line, y) => {
    return line.map((col, x) => {
      return col === 'O' ? [y, x] : []
    }).filter(coor => coor.length)
  }).filter(line => line.length)
    .flat()
}

function rollNorthV2(map: string[][], zeros: number[][]) {
  return zeros.reduce((map, zeroCoordinates) => {
    const [y, x] = zeroCoordinates;
    [...Array(y + 1).keys()].map(i => y - i).some(i => {
      if (map[i - 1] === undefined || 'O#'.includes(map[i - 1][x])) {
        map[y][x] = '.'
        map[i][x] = 'O'
        return true;
      }
    })
    return map
  }, map)
}

function sumZeroLocations(map: string[][]) {
  return map.toReversed().reduce((total, line, i) => {
    return total + (i + 1) * line.reduce((total, char) => {
      return total + (char === 'O' ? 1 : 0)
    }, 0)
  }, 0)
}

function rotateArray(lines: string[][]) {
  return [...Array(lines[0].length).keys()].map(i => {
    return lines.map(line => line[i]).toReversed()
  })
}

function fullRotation(map: string[][]) {
  return [...Array(4).keys()].reduce((old) => {
    return rotateArray(rollNorthV2(old, getZeros(old)))
  }, map)
}

function rotateRec(map: string[][], oldMaps: string[] = [], counter: number = 0) {
  console.log(counter)
  oldMaps.push(JSON.stringify(map))
  map = fullRotation(map);
  if (oldMaps.includes(JSON.stringify(map))) {
    return {
      newMap: map,
      finalIndex: counter + 1,
      loopLength: 1 + counter - oldMaps.indexOf(JSON.stringify(map)),
    }
  }
  return rotateRec(map, oldMaps, counter + 1)
}

const factor = 1000000000;
// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const map = fileContent.split(/\n/).filter(line => line).map(str => str.split(''))
map.forEach(line => console.log(line.join('')))

const { newMap, finalIndex, loopLength } = rotateRec(map);
const answer = sumZeroLocations(
  [...Array((factor - finalIndex) % loopLength).keys()].reduce(map => {
    console.log(`CHECKING`, sumZeroLocations(map))
    return fullRotation(map)
  }, newMap)
)
console.log(answer)
console.log(answer === 90551 || answer === 64)

// PART 1 ANSWER: 110677
// PART 2 ANSWER: 90551

// OLD
// let loopLength = 0;
// let newMap = map;
// let finalIndex = 0;
// const oldMaps: string[] = [];
// for (let i = 0; i < factor; i++) {
//   console.log(i)
//   // const oldMap = newMap;
//   oldMaps.push(JSON.stringify(newMap))
//   newMap = fullRotation(newMap);
//   if (oldMaps.includes(JSON.stringify(newMap))) {
//     // console.log('BREAK')
//     // console.log('INDEX FROM OLD MAPS', oldMaps.indexOf(JSON.stringify(newMap)))
//     // console.log('CURRENT INDEX', i)
//     finalIndex = i + 1;
//     loopLength = 1 + i - oldMaps.indexOf(JSON.stringify(newMap))
//     break;
//   }
// }
//
// console.log(finalIndex, loopLength);
// // let newMap = map
// console.log('OUTSIDE', finalIndex, loopLength)
// const extraIterations = (factor - finalIndex) % loopLength
// console.log('EXTRA CYCLE COUNT')
// console.log(extraIterations)
// for (let i = 0; i < extraIterations; i++) {
//   newMap = fullRotation(newMap)
//   console.log(`+${i + 1}`, sumZeroLocations(newMap))
// }
// const sum = sumZeroLocations(newMap)
// console.log(sum)
// console.log(sum === 90551 || sum === 64)
