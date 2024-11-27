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

// const isCloseToInteger = (num) => Math.abs(num - Math.round(num)) < Number.EPSILON;
// const result = isCloseToInteger(1.0000000000000002) ? Math.round(1.0000000000000002) : 1.0000000000000002;
function precisionRounding(num: number) {
  // console.log(num.toFixed(8), num, Math.abs(num - Math.round(num)) < Number.EPSILON)
  // return Math.abs(num - Math.round(num)) < Number.EPSILON ? Math.round(num) : num
  return Number(num.toFixed(8))
}

function getIntersectionV2(hail1: Hail, hail2: Hail) {
  const s = precisionRounding(
    (hail2.pos.y - ((hail1.vel.y * hail2.pos.x) / hail1.vel.x) + ((hail1.vel.y * hail1.pos.x) / hail1.vel.x) - hail1.pos.y) / (
      ((hail1.vel.y * hail2.vel.x) / hail1.vel.x) - hail2.vel.y
    )
  )
  // console.log('s', s)
  if (s % 1 !== 0) return
  const t = precisionRounding(
    ((hail2.vel.x * s) + hail2.pos.x - hail1.pos.x) / hail1.vel.x
  )
  // console.log('t', t)
  if (s !== t) return
  const z1 = (hail1.vel.z * t) + hail1.pos.z  
  const z2 = (hail2.vel.z * s) + hail2.pos.z
  if (z1 !== z2) return
  if ((hail1.vel.x * t + hail1.pos.x) % 1 !== 0) return
  if ((hail1.vel.y * t + hail1.pos.y) % 1 !== 0) return
  if ((hail1.vel.z * t + hail1.pos.z) % 1 !== 0) return
  return t
}

function testLine(rock: Hail, stones: Hail[]) {
  // let successCount = 0
  const intersectionTimes = new Set<number>()
  const answer = stones.every(stone => {
    const time = getIntersection(rock, stone)
    // const time = getIntersectionV2(rock, stone)
    if (time && !intersectionTimes.has(time)) {
      // process.stdout.write(`\r${successCount}`)
      // successCount++
      // if (successCount > 2) console.log(successCount)
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
            if (
              rock.pos.x % 1 !== 0 ||
              rock.pos.y % 1 !== 0 ||
              rock.pos.z % 1 !== 0 ||
              rock.vel.x % 1 !== 0 ||
              rock.vel.y % 1 !== 0 ||
              rock.vel.z % 1 !== 0
            ) {
              throw Error('ROCK NOT INTEGER' + JSON.stringify(rock))
            }
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

function checkForSkipage(rock: Hail, time1: number, time2: number) {
  const diff = time1 - time2
  return ([ 'x', 'y', 'z' ] as Axis).every(axis => {
    return rock.vel[axis] % diff === 0
  })
}

// tested up until 48000, still no result
function findRockV2(hail1: Hail, hail2: Hail, allHail: Hail[]) {
  // const availableHail = allHail.filter(hail => ![ hail1.id, hail2.id ].includes(hail.id))
  const testCache: true[][] = [];
  let maxTime = allHail.length;
  while (true) {
    for (let time1 = 1; time1 <= maxTime; time1++) {
      for (let time2 = 1; time2 <= maxTime; time2++) {
      // for (let time2 = maxTime - allHail.length; time2 <= maxTime; time2++) {
        if (time1 === time2) continue;
        // if (testCache?.[time1]?.[time2]) {
        //   continue;
        // } else {
        //   if (!testCache[time1]) testCache[time1] = []
        //   testCache[time1][time2] = true
        // }
        const rock = getRock(hail1, hail2, time1, time2);
        // if (checkForSkipage(rock, time1, time2)) continue;
        // console.log(rock)
        // const rockStr = JSON.stringify(rock);
        // if (rockCache.has(rockStr)) {
        //   // console.log('skipping')
        //   skipCount++
        //   continue;
        // }
        // const rock = getRock(
        //   time1 < time2 ? hail1 : hail2,
        //   time1 < time2 ? hail2 : hail1,
        //   time1 < time2 ? time1 : time2,
        //   time1 < time2 ? time2 : time1,
        // )
        if (testLine(rock, allHail)) {
          return rock;
        }
        // else {
        //   rockCache.add(rockStr)
        // }
      }
    }
    maxTime += allHail.length
    // console.log('max time', maxTime)
    process.stdout.write(`\rmax time: ${maxTime}, elapsed time: ${(Bun.nanoseconds() - startTime) / 10**9} cache: ${rockCache.size.toLocaleString()} skipCount: ${skipCount.toLocaleString()}, at ${new Date().toLocaleTimeString()}`)
  }
}

function testFindRockV2(hails: Hail[]) {
  const answers: string[] = []
  for (let hail1i = 0; hail1i < hails.length; hail1i++) {
    for (let hail2i = 0; hail2i < hails.length; hail2i++) {
      if (hail1i === hail2i) continue;
      console.log(`testing ${hail1i} ${hail2i}`)
      const rock = findRockV2(hails[hail1i], hails[hail2i], hails)
      answers.push(JSON.stringify(rock))
      console.log(`done ${hail1i} ${hail2i}`)
    }
  }
  console.log(answers[0])
  return answers.every(rock => {
    return JSON.stringify(rock) === JSON.stringify(answers[0])
  })
}

const startTime = Bun.nanoseconds();
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

// const cache = new Set<string>();
const rockCache = new Set<string>();
// const rock = findRock(10, cache);
const rock = findRockV2(hailStones[0], hailStones[1], hailStones)
// // const rock = findRockV2(hailStones[4], hailStones[1], hailStones)
console.log(rock)
console.log(rock.pos.x + rock.pos.y + rock.pos.z)
console.log(`runtime: ${(Bun.nanoseconds() - startTime) / 10**9}`)
// console.log(iterCount)
// console.log(skipCount)

// console.log(findRockV2(hailStones[3], hailStones[1], hailStones))

// console.log(testFindRockV2(hailStones));
// console.log(findRockV2(hailStones[4], hailStones[1], hailStones))
// const testRock = getRock(
//   hailStones[4],
//   hailStones[1],
//   1,
//   3,
// )
// console.log(testRock)
// console.log(getIntersectionV2(testRock, hailStones[4]))

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
