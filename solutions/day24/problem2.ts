// input format: px py pz @ vx vy vz

type Position = { x: number, y: number, z: number }
type Hail = {
  // pos: Position,
  vel: Position,
  frames: Position[],
  id: number,
  // m: number,
  // b: number,
}

// function getIntersection(a: Hail, b: Hail) {
//   if (a.m === b.m) return
//   const x = (b.b - a.b) / (a.m - b.m)
//   const y = a.m * x + a.b
//   return { x, y }
// }

// function printHail(hail: Hail) {
//   return `${hail.pos.x}, ${hail.pos.y}, ${hail.pos.z} @ ${hail.vel.x}, ${hail.vel.y}, ${hail.vel.z}`
// }

// const isInPast: ((hail: Hail, int: { x: number, y: number }) => boolean)[] = [
//   (hail, int) => hail.vel.x < 0 && int.x > hail.pos.x,
//   (hail, int) => hail.vel.x > 0 && int.x < hail.pos.x,
//   (hail, int) => hail.vel.y < 0 && int.y > hail.pos.y,
//   (hail, int) => hail.vel.y > 0 && int.y < hail.pos.y,
// ]
// 
// function withinBoundsInc(min: number, val: number, max: number) {
//   return min <= val && val <= max
// }
// 
// function testPast(hail: Hail, int: { x: number, y: number }) {
//   return isInPast.some(func => func(hail, int))
// }

const config = { fileName: 'inputs.txt', min: 200000000000000, max: 400000000000000 }
// const config = { fileName: 'example.txt', min: 7, max: 27 }

const fileContents = await Bun.file(config.fileName).text()

const hailStones = fileContents
.split(/\n/)
.filter(line => line)
.map<Hail>((line, i) => {
  const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
  const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
  // const m = vy / vx
  // const b = py - m * px
  return {
    // pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    // m,
    // b,
    frames: [
      { x: px, y: py, z: pz }
    ],
    id: i,
  }
})
// PART 1
// .reduce((total1, hail1, i, arr) => {
//   return total1 + arr.slice(i).reduce((total2, hail2) => {
//     const int = getIntersection(hail1, hail2);
//     if (int) {
//       const { x, y } = int;
//       if (withinBoundsInc(config.min, x, config.max) && withinBoundsInc(config.min, y, config.max)) {
//         if (!testPast(hail1, int) && !testPast(hail2, int)) {
//           return total2 + 1
//         }
//       }
//     }
//     return total2
//   }, 0)
// }, 0)
// console.log(answer, answer === 16172)

function setNextFrame(stones: Hail[], newFrameCount = 1) {
  // console.log('CREATED NEXT FRAME', stones[0].frames.length)
  for (let i = 0; i < newFrameCount; i++) {
    stones.forEach(hail => {
      hail.frames.push({
        x: hail.frames[hail.frames.length - 1].x + hail.vel.x,
        y: hail.frames[hail.frames.length - 1].y + hail.vel.y,
        z: hail.frames[hail.frames.length - 1].z + hail.vel.z,
      })
    })
  }
}
// console.log(JSON.stringify(hailStones, undefined, 2))
// setNextFrame(hailStones)
// console.log(JSON.stringify(hailStones, undefined, 2))

function getDiff(a: Position, b: Position, step = 1) {
  // console.log('diffing', a, b)
  return {
    x: (b.x - a.x) / step,
    y: (b.y - a.y) / step,
    z: (b.z - a.z) / step,
  }
}

function stoneIsOutOfBounds(pos: Position) {
  const max = getMax(hailStones);
  if (pos.x >= max.x) return true;
  if (pos.y >= max.y) return true;
  if (pos.z >= max.z) return true;
  if (pos.x < 0) return true;
  if (pos.y < 0) return true;
  if (pos.z < 0) return true;
}

function getMax(hailStones: Hail[]) {
  return hailStones.reduce((max, hail) => {
    hail.frames.forEach(frame => {
      if (frame.x > max.x) max.x = frame.x
      if (frame.y > max.y) max.y = frame.y
      if (frame.z > max.z) max.z = frame.z
    })
    return max
  }, { x: 0, y: 0, z: 0 })
}

// function tracePath(time: number, used: number[], prevPos: Position, diff: Position) {
function tracePath(time: number, used: number[], prevPos: Position, diff: Position, initStr: string) {
  // prevPos is pos at time
  const newPos = {
    x: prevPos.x + diff.x,
    y: prevPos.y + diff.y,
    z: prevPos.z + diff.z,
  }
  // console.log('checking pos', newPos, diff, prevPos)
  // console.log('prevPos', JSON.stringify(prevPos))
  // console.log('diff', JSON.stringify(diff))
  // console.log('checking pos', JSON.stringify(newPos))
  // console.log(time, used)
  if (used.length === hailStones.length) {
    console.log('YEEEEEEEEEEEEEEEHAW')
    winner = true
    console.log(hailStones[used[0]].frames[1], diff)
    return true
  }

  const needed = hailStones.length - used.length;
  const timeLeft = hailStones[0].frames.length - time
  if (needed > timeLeft) {
    // if (time + used.length >= hailStones.length) {
    //   console.log('also cant do it')
    // }
    return false
  }
  // if (time + used.length >= hailStones.length) {
  //   console.log('cant do it')
  //   return false
  // }

  // If future point is further apart, return false

  // if (stoneIsOutOfBounds(newPos)) {
  //   // console.log('OUT OF BOUNDS')
  //   return false
  // }

  let fuckeryIndicator = false;
  const nextStone = hailStones.filter(stone => !used.includes(stone.id)).find(stone => {
    const [ pastPos, currPos ] = [ stone.frames[time], stone.frames[time + 1] ]
    // console.log(pastPos, currPos)
    // if (currPos) {
    //   console.log(
    //     distanceBetweenPoints(pastPos, prevPos),
    //     distanceBetweenPoints(currPos, newPos)
    //   )
    // }
    if (currPos && distanceBetweenPoints(pastPos, prevPos) <= distanceBetweenPoints(currPos, newPos)) {
      // If the stone is diverging, I think we can safely put it on the shit list (i.e. never check that combo again)
      // console.log('fuckery indicator is indicating')
      // console.log('found impossible')
      fuckeryIndicator = true;
      // impossible[initStr] = true;
      impossible[`${used[0]}, ${used[1]}`]
      // impossible.push(initStr)
      return true
    }

    return JSON.stringify(stone.frames[time + 1]) === JSON.stringify(newPos)
  })

  if (fuckeryIndicator) return false

  if (nextStone) {
    // console.log('found next stone')
    return tracePath(time + 1, used.concat(nextStone.id), newPos, diff, initStr)
  } else {
    return tracePath(time + 1, used, newPos, diff, initStr)
  }
}

function distanceBetweenPoints(a: Position, b: Position) {
  return ((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)**0.5
}

// This is all the frames we need to solve the example
// for (let i = 0; i < 3; i++) {
//   setNextFrame(hailStones)
// }
// setNextFrame(hailStones, hailStones.length)
setNextFrame(hailStones, 100)

// How do we exit this nested cluster as soon as we have a result?
// Generate extra frames until we find our answer
// Find ways to eliminate bad trajectories early
//  - idk maybe consider memoization
// Checked up to t=1500, but there is a chance we missed the answer
const startTime = Bun.nanoseconds();
const newFrameCount = 200;
let winner = false;
let result;
const impossible: { [key: string]: any } = {}
const availableFrames = [ ...Array(hailStones[0].frames.length - 1).keys() ].map(i => i + 1)
while (true) {
  hailStones.some(hail1 => {
    console.log('stone1', hail1.id)
    return hailStones.filter(hail2 => hail2.id !== hail1.id).some(hail2 => {
      // console.log('stone1', hail1.id, 'stone2', hail2.id)

      // idk this might have been a bad idea
      // Technically, at different times it could have a different trajectory
      // But if we account for hail1.id, hail2.id, time1, and time2, that doesnt really eliminate many possibilities
      if (impossible[`${hail1.id}, ${hail2.id}`]) return

      return availableFrames.some((time1, i) => {
        return availableFrames.slice(i + 1).some(time2 => {
          // console.log(
          //   'at root',
          //   'time1', time1,
          //   'time2', time2,
          //   'stone1', hail1.id,
          //   'stone2', hail2.id,
          // )
          const initStr = JSON.stringify([ time1, time2, hail1.id, hail2.id ])
          // if (impossible[initStr]) {
          if (impossible[`${hail1.id}, ${hail2.id}`]) {
            // console.log('skipping')
            return
          }
          const diff = getDiff(hail1.frames[time1], hail2.frames[time2], time2 - time1)
          // const answer = tracePath(time2, [ hail1.id, hail2.id ], hail2.frames[time2], diff)
          const answer = tracePath(time2, [ hail1.id, hail2.id ], hail2.frames[time2], diff, initStr)
          if (answer) {
            result = Object.keys(hail1.frames[time1]).reduce((total, coor) => {
              // @ts-ignore
              console.log(coor, hail1.frames[time1][coor] - (diff[coor] * time1))
              // @ts-ignore
              return total + hail1.frames[time1][coor] - (diff[coor] * time1)
            }, 0)
            return true
          }
        })
      })
    })
  })

  // if (hailStones[0].frames.length > 10) {
  //   console.log('fuckery')
  //   break;
  // }
  if (result) {
    break;
  } else {
    console.log('generating more frames')
    setNextFrame(hailStones, newFrameCount)
  }
}
// tracePath(3, [ 4, 1 ], hailStones[1].frames[3], getDiff(hailStones[4].frames[1], hailStones[1].frames[3], 2))

console.log(`Time: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
console.log('winner', winner)
console.log(result)
// console.log(
//   distanceBetweenPoints(
//     { x: 17, y: 6, z: 2 },
//     { x: 7, y: 4, z: 3 },
//   )
// )

// Here's the plan:
// First, generate our base data, if we have 6 stones, we need to generate at least t=6 worth of data
//  - This is based off the assumption that we CANNOT hit two stones at the same time
// Check of there is any combination of hail stones that makes a straight line
//  - We can just dfs from each stone until path is impossible
//    - if we have 6 stones, and 7 frames, we need to check starting from frame 0 and frame 1, but not frame 2
//      - Do we really need to check frame 0? That doesn't really make a lot of sense
//      - That would mean we are intersecting and throwing at the same time...
//    - use id numbers to avoid checking the same hail stone twice
//  - To check for line, we need to see if the same diff can get us through all points
//  - Keep in mind there can be empty spots between hail stones, i.e. one intersection at t=1 and another at t=3 is still valid
// If no line can be formed, increment time and add new node for the next 'frame', check for line again
// Once we have found line, we need a few things
//  - The diff (we can figure that out from two points if need be)
//  - A point and the time it gets intersected at
//  - Using this information we can find the position at t=0
//  - once we have position, add up x + y + z, this is the final answer
// It is worth noting that the stone MUST be thrown at t=0
//
// Questions:
// Can we have multiple intersections at the same time?
//  - The example indicates no, and logic also tells us that two things cant be in the same place at the same time
//  - The problem also indicates that no two stones will ever be in the same place at the same time, once we account for the z-axis
// Can intersections happen between time intervals? (i.e. two stones interest at t=1=5)
//  - Example also indicates no

// ANSWER PART 1: 16172
//
//
// IDK THIS IS WHERE U UNDO TO
