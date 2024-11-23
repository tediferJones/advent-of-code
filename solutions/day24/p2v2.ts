type Position = { x: number, y: number, z: number }

type Hail = {
  vel: Position,
  pos: Position,
  id: number,
}

function getDiff(a: Position, b: Position, step = 1) {
  // console.log('diffing', a, b)
  return {
    x: (b.x - a.x) / step,
    y: (b.y - a.y) / step,
    z: (b.z - a.z) / step,
  }
}

function distanceBetweenPoints(a: Position, b: Position) {
  // return ((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)**0.5
  return ((b.x - a.x)**2 + (b.y - a.y)**2 + (b.z - a.z)**2)**0.5
}

function isConvergent(rock: Hail, stone: Hail, time: number) {
  // given a position and direction, see if the stone is converging or diverging
  // Our hope is that there is only one path where all points converge
  // But we will still have to check all stones at all possible time combinations

  const firstDistance = distanceBetweenPoints(posAtTime(rock, time), posAtTime(stone, time))
  const secondDistance = distanceBetweenPoints(posAtTime(rock, time + 1), posAtTime(stone, time + 1))
  // console.log('first position', 'rock', posAtTime(rock, time), 'stone', posAtTime(stone, time), firstDistance)
  // console.log('second position', 'rock', posAtTime(rock, time + 1), 'stone', posAtTime(stone, time + 1), secondDistance)
  // console.log(stone.id, firstDistance > secondDistance, firstDistance, secondDistance)
  return firstDistance > secondDistance
}

function posAtTime(stone: Hail, time: number) {
  return {
    x: stone.pos.x + stone.vel.x * time,
    y: stone.pos.y + stone.vel.y * time,
    z: stone.pos.z + stone.vel.z * time,
  }
}

function allConverge(rock: Hail, used: number[], time: number) {
  return hailStones.filter(stone => !used.includes(stone.id)).every(stone => {
    // console.log(stone.id, isConvergent(rock, stone, time))
    return isConvergent(rock, stone, time)
  })
}

function getRock(hail1: Hail, hail2: Hail, time1: number, time2: number) {
  // This will generate rock pos at time = 0
  const diff = getDiff(
    posAtTime(hail1, time1),
    posAtTime(hail2, time2),
    time2 - time1
  )
  return {
    pos: posAtTime({
      pos: posAtTime(hail2, time2),
      vel: diff,
      id: NaN
    }, time2 * -1),
    vel: diff, 
    id: NaN,
  }
}

function getIntersection(hail1: Hail, hail2: Hail) {
  // console.log(hail1, hail2)
  // hail1        hail2
  // 24 - 3x = 20 - 2x
  // 24 - 20 = -2x + 3x
  // 4 = x
  // return {
  //   x: (hail1.pos.x - hail2.pos.x) / (hail2.vel.x - hail1.vel.x),
  //   y: (hail1.pos.y - hail2.pos.y) / (hail2.vel.y - hail1.vel.y),
  //   z: (hail1.pos.z - hail2.pos.z) / (hail2.vel.z - hail1.vel.z),
  // }

  // Why does this work? Hard to say
  // How did we get this? By being bad at algebra
  return (hail1.pos.x - hail2.pos.x) / (hail2.vel.x - hail1.vel.x) ||
    (hail1.pos.y - hail2.pos.y) / (hail2.vel.y - hail1.vel.y) ||
    (hail1.pos.z - hail2.pos.z) / (hail2.vel.z - hail1.vel.z)

}

function testLine(rock: Hail, stones: Hail[]) {
  const intersectionTimes: number[] = []
  const answer = stones.every(stone => {
    const time = getIntersection(rock, stone)
    if (time % 1 === 0 && !intersectionTimes.includes(time)) {
      intersectionTimes.push(time)
      return true
    }
  })

  if (answer) console.log(intersectionTimes)
  return answer
}

const fileContents = await Bun.file('example.txt').text();
// const fileContents = await Bun.file('inputs.txt').text()

const hailStones = fileContents
.split(/\n/)
.filter(line => line)
.map<Hail>((line, i) => {
  const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
  const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
  return {
    pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    id: i,
  }
})

// TO-DO
//
// How do we handle caching?
// Move hailStones.some to its own function, should look something like this:
//  - checkTimeSpan(maxTime, cache)
//  - keep increasing maxTime until we get an answer
// Get cacheing working
// Do we really need allConverge function?
//  - Couldn't we just use testLine for the same result?
// Verify testLine function is working as we expect it to
//  - in theory, x = y = z, but in the example we have one case where y = NaN
//  - change intersectionTimes array to a set for faster lookups

const timeSpan = 3;
// const cache: { [key: string]: true } = {} // this could also be a set
let finalRock;
hailStones.some(hail1 => {
  return hailStones.some(hail2 => {
    if (hail1 === hail2) return
    for (let time1 = 1; time1 <= timeSpan; time1++) {
      for (let time2 = time1 + 1; time2 <= timeSpan; time2++) {
        // const initStr = `${hail1.id}, ${hail2.id}, ${time1}, ${time2}`
        // if (cache[initStr]) continue
        console.log(hail1.id, hail2.id, time1, time2)
        const rock = getRock(hail1, hail2, time1, time2)
        const result = allConverge(rock, [ hail1.id, hail2.id ], time2)
        if (result) {
          console.log('line between', hail1.id, hail2.id, 'at', time1, time2)
          const isWinner = testLine(rock, hailStones)
          if (isWinner) {
            finalRock = rock;
            return true
          }
        } else {
          // cache[initStr] = true
        }
      }
    }
    // This probably shouldnt be here
    // console.log('~~~~~~~~\nMORE FRAMES\n~~~~~~~~')
    // timeSpan + 1
  })
})
console.log(finalRock)

// const rock = getRock(hailStones[4], hailStones[1], 1, 3)
// console.log(getIntersection(rock, hailStones[0]))
// console.log(getIntersection(rock, hailStones[1]))
// console.log(getIntersection(rock, hailStones[2]))
// console.log(getIntersection(rock, hailStones[3]))
// console.log(getIntersection(rock, hailStones[4]))
// console.log(
//   allConverge(
//     rock,
//     [ 4, 1 ],
//     3
//   )
// )
// // console.log(stone1)
// // console.log(stone2)
// // console.log(diff)

// 4, 1, 2, 0, 3
// console.log(
//   isConvergent(
//     rock,
//     hailStones[3],
//     3
//   )
// )
