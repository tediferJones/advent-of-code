// ANSWER: 17287

// const fileContent = await Bun.file('./example.txt').text();
// const fileContent = await Bun.file('./example2.txt').text();
const fileContent = await Bun.file('./inputs.txt').text();
const lines = fileContent.split(/\n/).filter(line => line)

const router = lines.shift()
if (!router) throw Error('cant find route definition')
console.log(router)
const data: {
  [key: string]: {
    left: string,
    right: string
  }
} = {};

for (const line of lines) {
  // console.log(line)
  [...line.matchAll(/(\w+) = \((\w+), (\w+)\)/g)].map(match => {
    // console.log(match)
    data[match[1]] = {
      left: match[2],
      right: match[3],
    }
  })
}
// console.log(data)

// let currentNode = Object.keys(data)[0]
let currentNode = 'AAA';
console.log(currentNode)

let stepCounter = 0;
while (currentNode !== 'ZZZ') {
  for (let i = 0; i < router.length; i++) {
    const goto = router[i]
    if (goto === 'L') {
      currentNode = data[currentNode].left
    }
    if (goto === 'R') {
      currentNode = data[currentNode].right
    }
    stepCounter++
    if (currentNode === 'ZZZ') break;
  }
}
console.log('STEP COUNT = ', stepCounter)
