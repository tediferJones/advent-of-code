// Source: https://www.youtube.com/watch?v=guOyA7Ijqgk&ab_channel=HyperNeutrino

const fileContents = await Bun.file('example.txt').text();
// const fileContents = await Bun.file('inputs.txt').text();
const equations: string[] = []

fileContents
  .split(/\n/)
  .filter(line => line)
  .map((line, i) => {
    const match = line.match(/(-?\d+),\s+(-?\d+),\s+(-?\d+)\s+@\s+(-?\d+),\s+(-?\d+),\s+(-?\d+)/)!
    const [ _, px, py, pz, vx, vy, vz ] = match.map(num => Number(num))
    equations.push(`(x - ${px}) * (${vy} - b) - (y - ${py}) * (${vx} - a)`);
    equations.push(`(y - ${py}) * (${vz} - c) - (z - ${pz}) * (${vy} - b)`);
    // equations.push(`(x - ${px}) * (${vy} - b) - (y - ${py}) * (${vx} - a) = 0`);
    // equations.push(`(y - ${py}) * (${vz} - c) - (z - ${pz}) * (${vy} - b) = 0`);
  })

console.log(equations)
console.log(math.simplify(equations[0]).toString())
// console.log(math.simplify(equations[0]))

// const math = require('mathjs');
import * as math from 'mathjs'

// Define the matrix A and vector b
const A = math.matrix([[2, 1], [1, -1]]);
const b = math.matrix([3, 0]);

// Solve for x in Ax = b
const x = math.lusolve(A, b);

console.log(x.toArray()); // Output: [1, 1]
