const fileContent = await Bun.file('example.txt').text()
// const fileContent = await Bun.file('inputs.txt').text()

const [tempWorkflows, tempParts] = fileContent.split(/\n\n/)
const parts = tempParts.split(/\n/).filter(line => line)
const workflows = tempWorkflows.split(/\n/)

interface PartObj {
  [key: string]: number
}

// const partObjs: { [key: string]: number }[] = [];
// parts.map(part => {
//   const partObj: { [key: string]: number } = {};
//   const match = part.match(/{(.+)}/)
//   if (!match) throw Error('COULDNT EXTRACT WORKFLOW')
//   match[1].split(',').forEach(str => {
//     const [letter, number] = str.split('=')
//     partObj[letter] = Number(number)
//   })
//   partObjs.push(partObj)
// })
//
interface WorkFlowObj {
  char: string,
  compare: string,
  num: number,
  destination: string,
}

const workflowObjs: { [key: string]: WorkFlowObj[] } = {};
workflows.forEach(workflow => {
  const match = workflow.match(/(\w+){(.+)}/)
  if (!match) throw Error('COULDNT EXTRACT WORKFLOW')
  const name = match[1]
  const constraints = match[2]
  // const workFlowFuncs: Function[] = [];
  const workFlows: WorkFlowObj[] = [];
  constraints.split(',').forEach(constraint => {
    const match = constraint.match(/([xmas])([><])(\d*):(\w+)/)
    if (match === null) {
      workFlows.push({
        char: '',
        compare: '',
        num: 0,
        destination: constraint,
      })
      return
    }

    if (!match) throw Error('COULDNT EXTRACT CONSTRAINT FROM WORKFLOW')
    const [fullMatch, char, compare, num, destination] = match;
    workFlows.push({
      char, compare, num: Number(num), destination
    })
  })
  workflowObjs[name] = workFlows
})
// console.log(workflowObjs)
// console.log('TEST', workflowObjs['in'][0](partObjs[0]))

interface MinMax {
  min: number,
  max: number,
}
interface ResultItem {
  allKeys?: string[],
  key: string,
  ranges: {
    [key: string]: any,
    x: MinMax,
    m: MinMax,
    a: MinMax,
    s: MinMax,
  }
}

function getOppositeMinMax(arr: WorkFlowObj[], nextKey: string, start: ResultItem) {
  start.key = nextKey;
  for (const item of arr) {
    if (item.compare === '<') {
      if (item.num > start.ranges[item.char].min) {
        start.ranges[item.char].min = item.num
      }
    }
    if (item.compare === '>') {
      if (item.num < start.ranges[item.char].max) {
        start.ranges[item.char].max = item.num
      }
    }
  }
  return start
}

const start = {
  allKeys: [],
  key: 'in',
  ranges: {
    x: {
      min: 0,
      max: 4000,
    },
    m: {
      min: 0,
      max: 4000,
    },
    a: {
      min: 0,
      max: 4000,
    },
    s: {
      min: 0,
      max: 4000,
    },
  },
}

function walkTree(nodes: ResultItem[] = [start], results: ResultItem[] = []) {
  const current = nodes.shift();
  if (!current) return results;
  current.allKeys?.push(current.key)
  if (current.key === 'A') {
    results.push(current)
    return walkTree(nodes, results)
  }
  if (current.key === 'R') {
    return walkTree(nodes, results)
  }
  const possibilities = workflowObjs[current.key]
  possibilities.forEach(workflow => {
    // console.log(workflow)
    const copy = JSON.parse(JSON.stringify(current))
    if (!workflow.char && !workflow.compare && !workflow.num) {
      copy.key = workflow.destination
      return nodes.push(getOppositeMinMax(possibilities, workflow.destination, copy))
    }
    if (workflow.compare === '<') {
      if (copy.ranges[workflow.char].max > workflow.num) {
        copy.ranges[workflow.char].max = workflow.num
      }
    }
    if (workflow.compare === '>') {
      if (copy.ranges[workflow.char].min < workflow.num) {
        copy.ranges[workflow.char].min = workflow.num
      }
    }
    copy.key = workflow.destination
    nodes.push(copy)
  })
  // console.log('NEW NODES')
  // nodes.forEach(node => console.log(node.ranges))
  return walkTree(nodes, results)
}
const accepted = walkTree();
console.log(accepted.length)
let total = 0;
accepted.forEach(result => {
  const idk = Object.keys(result.ranges).map(char => {
    const { min, max } = result.ranges[char]
    return max - min;
  })
  console.log(result.allKeys)
  console.log(idk)
  total += idk.reduce((total, num) => total * num)
})
console.log(total)
console.log(total.toString().length)
// console.log(superResult)

// ANSWER PART 1: 489392
