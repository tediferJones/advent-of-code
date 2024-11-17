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

// const config = { fileName: 'inputs.txt', min: 200000000000000, max: 400000000000000 }
const config = { fileName: 'example.txt', min: 7, max: 27 }

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

type Diff = { x: number, y: number, z: number }
function getDiff(a: Hail, b: Hail): Diff {
  return {
    x: a.vel.x - b.vel.x,
    y: a.vel.y - b.vel.y,
    z: a.vel.z - b.vel.z,
  }
}

// function getAllPositions(stones: Hail[]) {
//   const trajectories: Diff[][]  = []
//   stones.forEach((hail1, i) => {
//     trajectories.push(
//       stones.map(hail2 => hail1 !== hail2 ? getDiff(hail1, hail2) : undefined).filter(diff => diff !== undefined) as Diff[]
//     )
//   })
//   console.log(trajectories)
// }
// // getAllPositions(hailStones)
// 
// function findLine(diffs: Diff[][]) {
//   return diffs.find(hailDiffs => {
//     hailDiffs.find(diff => {
//       const strDiff = JSON.stringify(diff)
//     })
//   })
// }

function setNextFrame(stones: Hail[]) {
  console.log('CREATED NEXT FRAME')
  stones.forEach(hail => {
    hail.frames.push({
      x: hail.frames[hail.frames.length - 1].x + hail.vel.x,
      y: hail.frames[hail.frames.length - 1].y + hail.vel.y,
      z: hail.frames[hail.frames.length - 1].z + hail.vel.z,
    })
  })
}
console.log(JSON.stringify(hailStones, undefined, 2))
setNextFrame(hailStones)
console.log(JSON.stringify(hailStones, undefined, 2))

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
