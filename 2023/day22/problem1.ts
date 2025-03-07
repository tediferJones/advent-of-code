function getMinMax(brick: number[], char: string) {
  const counter = char === 'x' ? 0 : char === 'y' ? 1 : 2
  const [start, end] = [brick[0 + counter], brick[3 + counter]]
  return start < end ? [start, end] : [end, start]
}

function overlap(a: number[], b: number[]) {
  return Math.max(a[0], b[0]) <= Math.min(a[3], b[3]) && Math.max(a[1], b[1]) <= Math.min(a[4], b[4])
}

function fall(map: number[][], justChecking?: boolean) {
  for (let i = 0; i < map.length; i++) {
    const brick = map[i];
    const [minZ, maxZ] = getMinMax(brick, 'z');

    if (minZ === 1) {
      continue
    }

    const bricksBelow = map.map((checkBrick, i) => {
      return (minZ - 1) === getMinMax(checkBrick, 'z')[1] ?
        i : -1
    }).filter(num => num > -1).map(i => map[i])

    const canFall = bricksBelow.every(brickBelow => {
      return !overlap(brick, brickBelow)
    })
    if (canFall) {
      if (justChecking) return canFall
      brick[2] -= 1 
      brick[5] -= 1
    }
  }
}

function keepFalling(map: number[][]) {
  let old = ''
  while (JSON.stringify(map) !== old) {
    old = JSON.stringify(map)
    fall(map)
  }
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => {
    return line.split(/~/)
      .map(coordinate => coordinate.split(',').map(str => Number(str))).flat()
  }).sort((a, b) => (a[2] < a[5] ? a[2] : a[5]) - (b[2] < b[5] ? b[2] : b[5]));

console.log('let bricks fall')
keepFalling(map)
console.log('all bricks have fallen')

let total = 0;
map.forEach((brick, i) => {
  const canFall = fall(map.toSpliced(i, 1), true)
  if (!canFall) total++
})
console.log(total)

// ANSWER PART 1: 426

// for each block, slice that block from map, and see if the array could fall
// if it can't fall, total + 1

// console.log(map)
// fall(map)
// console.log(map)
// fall(map)
// console.log(map)
// fall(map)
// console.log(map)
// fall(map)
// console.log(map)

