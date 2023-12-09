// ANSWER
// 18625484023687

function getGcd(a: number, b: number): number {
  return b < 1 ? a : getGcd(b, a % b);
}

// const fileContent = await Bun.file('./example.txt').text();
// const fileContent = await Bun.file('./example2.txt').text();
// const fileContent = await Bun.file('./example-for-problem2.txt').text();
const fileContent = await Bun.file('./inputs.txt').text();
const lines = fileContent.split(/\n/).filter(line => line);
const router = lines.shift()?.split('');
const currentPositions: string[] = [];
const data: {
  [key: string]: {
    [key: string]: string,
    L: string,
    R: string,
  }
} = {};

if (!router) throw Error('cant find route definition');

lines.forEach(line => {
  [...line.matchAll(/(\w+) = \((\w+), (\w+)\)/g)]
    .forEach(match => {
      data[match[1]] = { L: match[2], R: match[3] }
      // if (match[1] === 'AAA') {
      if (match[1][match[1].length - 1] === 'A') {
        currentPositions.push(match[1])
      }
    })
})
console.log('STARTING POSITION: ', currentPositions)

// Calculate the number of steps it takes to get to
// a terminal state for each possible starting point
// Then just find the LCM of all those numbers
let lcm = 1;
currentPositions.map(node => {
  let stepCounter = 0;
  // while (node !== 'ZZZ') {
  while (node[node.length - 1] !== 'Z') {
    router.forEach(dir => {
      node = data[node][dir]
      stepCounter++
    })
  }
  return stepCounter;
}).forEach(num => lcm = (lcm * num) / getGcd(lcm, num));

console.log(lcm)
console.log(lcm === 18625484023687)

