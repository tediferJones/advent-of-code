function allEndInZ(arr: string[]) {
  for (const item of arr) {
    if (item[item.length - 1] !== 'Z') {
      // return false
      return true
    }
  }
  // return true
  return false
}

// const fileContent = await Bun.file('./example.txt').text();
// const fileContent = await Bun.file('./example2.txt').text();
// const fileContent = await Bun.file('./example-for-problem2.txt').text();
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
const currentPositions: string[] = [];

for (const line of lines) {
  // console.log(line)
  [...line.matchAll(/(\w+) = \((\w+), (\w+)\)/g)].map(match => {
    // console.log(match)
    data[match[1]] = {
      left: match[2],
      right: match[3],
    }
    // console.log(match[1])
    if (match[1][match[1].length - 1] === 'A') {
      currentPositions.push(match[1])
    }
  })
}
console.log('STARTING POSITION: ', currentPositions)
// console.log(data)

// let currentNode = Object.keys(data)[0]
// let currentNode = 'AAA';
// console.log(currentNode)

let stepCounter = 0;
while (allEndInZ(currentPositions)) {
  for (let i = 0; i < router.length; i++) {
    if (!(stepCounter % 1000000000)) console.log(stepCounter)
    // const goto = router[i]
    // if (goto === 'L') {
    //   currentNode = data[currentNode].left
    // }
    // if (goto === 'R') {
    //   currentNode = data[currentNode].right
    // }
    // stepCounter++
    // if (currentNode === 'ZZZ') break;
    for (let j = 0; j < currentPositions.length; j++) {
      // console.log('CHECKING: ', currentPositions[j])
      if (router[i] === 'L') {
        currentPositions[j] = data[currentPositions[j]].left;
      }
      if (router[i] === 'R') {
        currentPositions[j] = data[currentPositions[j]].right;
      }
      // if (allEndInZ(currentPositions)) break;
      // break;
      // if (!allEndInZ(currentPositions)) {
      //   // console.log('WTF')
      //   stepCounter += 2
      //   console.log('INNER BREAK')
      //   break;
      // };
    }
    // console.log(currentPositions)
    // console.log('DIR', router[i])
    // console.log(currentPositions)
    stepCounter++;
    // console.log(!allEndInZ(currentPositions))
    if (!allEndInZ(currentPositions)) {
      // console.log('WTF')
      console.log('DONE');
      break;
    };
  }
}
console.log('FINAL POSITION: ', currentPositions);
console.log('STEP COUNT = ', stepCounter);
