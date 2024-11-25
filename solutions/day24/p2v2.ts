type Position = { x: number, y: number, z: number }
type Hail = { vel: Position, pos: Position, id: number }
type Axis = Array<keyof Position>

function getDiff(a: Position, b: Position, step = 1) {
  return {
    x: (b.x - a.x) / step,
    y: (b.y - a.y) / step,
    z: (b.z - a.z) / step,
  }
}

function posAtTime(stone: Hail, time: number) {
  return {
    x: stone.pos.x + stone.vel.x * time,
    y: stone.pos.y + stone.vel.y * time,
    z: stone.pos.z + stone.vel.z * time,
  }
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

// Formula for intersection
// Solve each coorindate independently, if t is the same for all, we have an intersection
//      x1 - x2
// t = ---------
//     dx2 - dx1
// if numerator and denominator are 0, skip it (still valid)
// else if denominator is 0, failed
// else if new result does not match old result, return invalid
function getIntersection(hail1: Hail, hail2: Hail) {
  let result = NaN;
  const valid = ([ 'x', 'y', 'z' ] as Axis).every(axis => {
    if (hail1.vel[axis] === hail2.vel[axis]) {
      return hail1.pos[axis] === hail2.pos[axis]
    }
    const intersection = (hail1.pos[axis] - hail2.pos[axis]) / (hail2.vel[axis] - hail1.vel[axis])
    if (!result && intersection % 1 === 0 && intersection > 0) {
      result = intersection
    }
    return result === intersection
  })

  return valid ? result : null
}

function testLine(rock: Hail, stones: Hail[]) {
  let successCount = 0
  const intersectionTimes = new Set<number>()
  const answer = stones.every(stone => {
    const time = getIntersection(rock, stone)
    if (time && !intersectionTimes.has(time)) {
      process.stdout.write(`\r${successCount}`)
      successCount++
      if (successCount > 2) console.log(successCount)
      intersectionTimes.add(time)
      return true
    }
  })

  // if (answer) console.log(intersectionTimes)
  return answer
}

// let iterCount = 0
let skipCount = 0;
function findRock(timeStep: number, cache: Set<string>) {
  let finalRock: Hail = {} as Hail;
  let count = 1;
  while (true) {
    const timeSpan = timeStep * count
    const foundLine = hailStones.some(hail1 => {
      // console.log('checking', hail1.id)
      return hailStones.some(hail2 => {
        if (hail1 === hail2) return
        for (let time1 = 1; time1 <= timeSpan; time1++) {
          for (let time2 = time1 + 1; time2 <= timeSpan; time2++) {
            // const initStr = `${hail1.id}, ${hail2.id}, ${time1}, ${time2}`
            // if (cache.has(initStr)) {
            //   skipCount++
            //   continue
            // }
            // console.log(hail1.id, hail2.id, time1, time2)
            const rock = getRock(hail1, hail2, time1, time2)
            // const rockStr = JSON.stringify(rock)
            const rockStr = `${rock.pos.x},${rock.pos.y},${rock.pos.z},${rock.vel.x},${rock.vel.y},${rock.vel.z}`
            if (rockCache.has(rockStr)) {
              console.log('skipping')
              skipCount++
              continue
            }
            if (testLine(rock, hailStones)) {
              finalRock = rock;
              return true
            } else {
              // cache.add(initStr)
              rockCache.add(rockStr)
            }
            process.stdout.write(`\r${time1.toString().length === 1 ? ' ' : ''}${time1}/${timeSpan}, stone1: ${hail1.id}, stone2: ${hail2.id}`)
            // iterCount++
          }
        }
      })
    })
    if (foundLine) break;
    console.log('checked up to', timeStep * count, 'skip count', skipCount, 'time', `${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
    count++
  }
  return finalRock;
}

const startTime = Bun.nanoseconds();
// const fileContents = await Bun.file('example.txt').text();
const fileContents = await Bun.file('inputs.txt').text()

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

const cache = new Set<string>();
const rockCache = new Set<string>();
const rock = findRock(10, cache);
console.log(rock)
console.log(rock.pos.x + rock.pos.y + rock.pos.z)
// console.log(iterCount)
console.log(skipCount)

// const rock = getRock(hailStones[4], hailStones[1], 1, 3)
// console.log(getIntersection(rock, hailStones[0]))
// console.log(getIntersection(rock, hailStones[1]))
// console.log(getIntersection(rock, hailStones[2]))
// console.log(getIntersection(rock, hailStones[3]))
// console.log(getIntersection(rock, hailStones[4]))

// function distanceBetweenPoints(a: Position, b: Position) {
//   // return ((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)**0.5
//   return ((b.x - a.x)**2 + (b.y - a.y)**2 + (b.z - a.z)**2)**0.5
// }
// // given a position and direction, see if the stone is converging or diverging
// function isConvergent(rock: Hail, stone: Hail, time: number) {
//   const firstDistance = distanceBetweenPoints(posAtTime(rock, time), posAtTime(stone, time))
//   const secondDistance = distanceBetweenPoints(posAtTime(rock, time + 1), posAtTime(stone, time + 1))
//   return firstDistance > secondDistance
// }
// function allConverge(rock: Hail, used: number[], time: number) {
//   return hailStones.filter(stone => !used.includes(stone.id)).every(stone => {
//     // console.log(stone.id, isConvergent(rock, stone, time))
//     return isConvergent(rock, stone, time)
//   })
// }
// console.log(allConverge(rock, [ 4, 1 ], 3))
// // console.log(stone1)
// // console.log(stone2)
// // console.log(diff)
// // 4, 1, 2, 0, 3
// console.log(isConvergent(rock, hailStones[3], 3))
