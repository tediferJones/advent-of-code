// Source: https://www.youtube.com/watch?v=guOyA7Ijqgk&ab_channel=HyperNeutrino
// With lots of help from chatGPT and r/adventofcode

import { init } from 'z3-solver';
import fs from 'node:fs'

if (process.argv[0].includes('bun')) {
  throw Error('This file cant be run with bun, please use nodejs instead')
}

(async () => {
  const { Context } = await init()
  const z3 = Context('main')

  const x = z3.Int.const('x')
  const y = z3.Int.const('y')
  const z = z3.Int.const('z')
  const dx = z3.Int.const('dx')
  const dy = z3.Int.const('dy')
  const dz = z3.Int.const('dz')

  // const fileContents = fs.readFileSync('example.txt', 'utf8')
  const fileContents = fs.readFileSync('inputs.txt', 'utf8')
  const equations = []

  const hailStones = fileContents
    .split(/\n/)
    .filter(line => line)
    .map((line, i) => {
      const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)
      const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))

      equations.push(
        ((x.sub(px)).mul(z3.Int.val(vy).sub(dy))).sub(
          (y.sub(z3.Int.val(py))).mul(z3.Int.val(vx).sub(dx))
        ).eq(0)
      )
      equations.push(
        ((y.sub(z3.Int.val(py))).mul((z3.Int.val(vz)).sub(dz))).sub(
          (z.sub(z3.Int.val(pz))).mul((z3.Int.val(vy)).sub(dy))
        ).eq(0)
      )

      return {
        pos: { x: px, y: py, z: pz },
        vel: { x: vx, y: vy, z: vz },
        id: i,
      }
      // equations.push(`(x - ${px}) * (${vy} - b) - (y - ${py}) * (${vx} - a) = 0`);
      // equations.push(`(y - ${py}) * (${vz} - c) - (z - ${pz}) * (${vy} - b) = 0`);
    })

  const solver = new z3.Solver();
  equations.forEach(eq => solver.add(eq))
  const checkResult = await solver.check()

  if (checkResult === 'sat') {
    const model = solver.model();
    const rock = {
      pos: {
        x: Number(model.eval(x).toString()),
        y: Number(model.eval(y).toString()),
        z: Number(model.eval(z).toString()),
      },
      vel: {
        x: Number(model.eval(dx).toString()),
        y: Number(model.eval(dy).toString()),
        z: Number(model.eval(dz).toString()),
      }
    }

    console.log(rock)
    console.log('solution is valid:', testLine(rock, hailStones))
    console.log('answer:', rock.pos.x + rock.pos.y + rock.pos.z)
    
    process.exit()

    // Exclude this solution to find others
    // solver.add(
    //   z3.Not(
    //     z3.And(
    //       x.eq(model.eval(x)),
    //       y.eq(model.eval(y)),
    //       z.eq(model.eval(z)),
    //       a.eq(model.eval(a)),
    //       b.eq(model.eval(b)),
    //       c.eq(model.eval(c)),
    //     )
    //   )
    // );
  }
})();

// Formula for intersection
// Solve each coorindate independently, if t is the same for all, we have an intersection
//      x1 - x2
// t = ---------
//     dx2 - dx1
// if numerator and denominator are 0, skip it (still valid)
// else if denominator is 0, failed
// else if new result does not match old result, return invalid
function getIntersection(hail1, hail2) {
  let result = NaN;
  const valid = ([ 'x', 'y', 'z' ]).every(axis => {
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

function testLine(rock, stones) {
  const intersectionTimes = new Set()
  const answer = stones.every(stone => {
    const time = getIntersection(rock, stone)
    // console.log('time', time?.toLocaleString())
    if (time && !intersectionTimes.has(time)) {
      intersectionTimes.add(time)
      return true
    }
  })

  // if (answer) console.log(intersectionTimes)
  return answer
}
