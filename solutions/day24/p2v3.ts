// Source: https://www.youtube.com/watch?v=guOyA7Ijqgk&ab_channel=HyperNeutrino

// This kinda works, but only gives one answer which contains non-integers
// import nerdamer from 'nerdamer';
// import 'nerdamer/Solve';

type Position = { x: number, y: number, z: number }
type Hail = { vel: Position, pos: Position, id: number }
type Axis = Array<keyof Position>

const fileContents = await Bun.file('example.txt').text();
// const fileContents = await Bun.file('inputs.txt').text();
const equations: string[] = []

const hailstones = fileContents
.split(/\n/)
.filter(line => line)
.map((line, i) => {
  const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
  const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
  // equations.push(`(x - ${px}) * (${vy} - b) - (y - ${py}) * (${vx} - a)`);
  // equations.push(`(y - ${py}) * (${vz} - c) - (z - ${pz}) * (${vy} - b)`);
  equations.push(`(x - ${px}) * (${vy} - b) - (y - ${py}) * (${vx} - a) = 0`);
  equations.push(`(y - ${py}) * (${vz} - c) - (z - ${pz}) * (${vy} - b) = 0`);
  return {
    pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    id: i,
  }
})

console.log(equations)

// console.log(equations)
// @ts-ignore
// nerdamer.set('SOLUTIONS_AS_OBJECT', true)
// const answer = nerdamer.solveEquations(equations.slice(0, 6), ['x', 'y', 'z', 'a', 'b', 'c'])
// console.log(`solveEquations([${equations.slice(0, 6)}])`)
// const answer = nerdamer(`solveEquations([${equations.slice(0, 6)}])`)
// console.log(answer.toString())

// TEST
// const sol = nerdamer.solveEquations('cos(x)+cos(3*x)=1');
// console.log('test', sol.toString());

// a,104.84357696192424,b,-337.00000000000017,c,-112.13868636203433,x,249888031444277.8,y,131766988959681.98,z,280648299848874.2

const rock = {
  // pos: {
  //   x: Math.round(249888031444277.8),
  //   y: Math.round(131766988959681.98),
  //   z: Math.round(280648299848874.2),
  // },
  // vel: {
  //   x: Math.round(104.84357696192424),
  //   y: Math.round(-337.00000000000017),
  //   z: Math.round(-112.13868636203433),
  // },
  pos: {
    x: Math.round(249888031444277.8),
    y: Math.round(131766988959681.98),
    z: Math.round(280648299848874.2),
  },
  vel: {
    x: Math.round(104.84357696192424),
    y: Math.round(-337.00000000000017),
    z: Math.round(-112.13868636203433),
  },
  id: NaN,
}

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
    console.log(time)
    // const time = getIntersectionV2(rock, stone)
    if (time && !intersectionTimes.has(time)) {
      // process.stdout.write(`\r${successCount}`)
      // successCount++
      if (successCount > 0) console.log(successCount)
      console.log('success')
      intersectionTimes.add(time)
      return true
    }
  })

  // if (answer) console.log(intersectionTimes)
  return answer
}

// console.log(testLine(rock, hailstones))

// console.log(math.simplify(equations[0]).toString())
// console.log(math.simplify(equations[0]))

// import * as math from 'mathjs'
// 
// // Define the matrix A and vector b
// const A = math.matrix([[2, 1], [1, -1]]);
// const b = math.matrix([3, 0]);
// 
// // Solve for x in Ax = b
// const x = math.lusolve(A, b);
// 
// console.log(x.toArray()); // Output: [1, 1]


// (x - 19) * (1 - b) - (y - 13) * (-2 - a) = 0, (y - 13) * (-2 - c) - (z - 30) * (1 - b) = 0, (x - 18) * (-1 - b) - (y - 19) * (-1 - a) = 0, (y - 19) * (-2 - c) - (z - 22) * (-1 - b) = 0, (x - 20) * (-2 - b) - (y - 25) * (-2 - a) = 0, (y - 25) * (-4 - c) - (z - 34) * (-2 - b) = 0


// SOLVING BY HAND
//
// EQUATIONS:
// (x - 19) * (1 - b) - (y - 13) * (-2 - a) = 0
// (y - 13) * (-2 - c) - (z - 30) * (1 - b) = 0
// (x - 18) * (-1 - b) - (y - 19) * (-1 - a) = 0
// (y - 19) * (-2 - c) - (z - 22) * (-1 - b) = 0
// (x - 20) * (-2 - b) - (y - 25) * (-2 - a) = 0
// (y - 25) * (-4 - c) - (z - 34) * (-2 - b) = 0
//
// (x - 19) * (1 - b) - (y - 13) * (-2 - a) = 0
// (x - xb - 19 + 19b) - (-2y - ya + 16 + 13a) = 0
// x - xb - 19 + 19b + 2y + ya - 16 - 13a = 0
// x - xb - 19 + 19b + 2y + ya - 16 - 13a = 0
// -x + xb - 19b = -19 + 2y + ya - 16 - 13a
// -x - b(x + 19) = -19 + 2y + ya - 16 - 13a
// -b(x + 19) = -19 + 2y + ya - 16 - 13a
// -b = (-19 + 2y + ya - 16 - 13a) / (x + 19)
// b = (35 - 2y - ya + 13a) / (x + 19)
//
// (x - 18) * (-1 - b) - (y - 19) * (-1 - a) = 0
// -x - xb + 18 + 18b - (-y - ya + 19 + 19a) = 0
// -x - xb -1 + 18b + y + ya - 19a = 0
// -x - x((35 - 2y - ya + 13a) / (x + 19)) - 1 + 18((35 - 2y - ya + 13a) / (x + 19)) + y + ya - 19a = 0
// -x - ((35x - 2yx - yax + 13ax) / (x + 19)) - 1 + ((630 - 36y - 18ya + 234a) / (x + 19)) + y + ya - 19a = 0
// -x - ((35x - 2yx - yax + 13ax) / (x + 19)) + ((630 - 36y - 18ya + 234a) / (x + 19)) + y + ya - 19a = 1
// -x(x + 19) - (35x - 2yx - yax + 13ax) + (630 - 36y - 18ya + 234) + y(x + 19) + ya(x + 19) - 19a(x + 19) = (x + 19)
// -x**2 - 19x - 35x - 2yx - yax + 13ax + 630 - 36y - 18ya + 234 + yx + 19y + yax + 19ya - 19ax - 361a = x + 19
// -x**2 - 54x - yx - 6ax + 864 - 17y + ya - 361a = x + 19 
// -x**2 - 54x - yx - 6ax + 845 - 17y + ya - 361a = x
// -x**2 - 55x - yx - 6ax + 845 - 17y + ya - 361a = 0
// -x**2 - 55x - 6ax + 845 - 361a = yx + 17y - ya
// -x**2 - 55x - 6ax + 845 - 361a = y(x + 17 - a)
// (-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a) = y
// y = (-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)
//
// B IMPROVED
// b = (35 - 2y - ya + 13a) / (x + 19)
// b = (35 - 2((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) - a((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) + 13a) / (x + 19)
// b = (35 - ((-2x**2 - 110x - 12ax + 1690 - 722a) / (x + 17 - a)) - ((-ax**2 - 55ax - 6xa**2 + 845a - 361a**w) / (x + 17 - a)) + 13a) / (x + 19)
//
//
// (x - 20) * (-2 - b) - (y - 25) * (-2 - a) = 0
// -2x - xb + 40 - 20b - (-2y - ya + 50 + 25a) = 0
// -2x - xb + 40 - 20b + 2y + ya - 50 - 25a = 0
// -2x - xb - 10 - 20b + 2y + ya - 25a = 0
// -2x - x((35 - 2((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) - a((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) + 13a) / (x + 19)) - 10 - 20((35 - 2((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) - a((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) + 13a) / (x + 19)) + 2((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) + a((-x**2 - 55x - 6ax + 845 - 361a) / (x + 17 - a)) - 25a = 0
// -2x - x((35 - (-2x**2 - )))
//
