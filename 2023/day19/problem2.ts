interface WorkFlowObj {
  char: string,
  compare: string,
  num: number,
  destination: string,
}

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

function getOppositeMinMax(arr: WorkFlowObj[], start: ResultItem) {
  return arr.reduce((start, item) => {
    if (item.compare === '<' && item.num > start.ranges[item.char].min) {
      start.ranges[item.char].min = item.num - 1
    }
    if (item.compare === '>' && item.num < start.ranges[item.char].max) {
      start.ranges[item.char].max = item.num
    }
    return start
  }, start)
}

function walkTree(nodes: ResultItem[], results: ResultItem[] = []) {
  const current = nodes.shift();
  if (!current) return results;
  current.allKeys?.push(current.key)
  if (['A', 'R'].includes(current.key)) {
    if (current.key === 'A') results.push(current)
    return walkTree(nodes, results)
  }
  workflowObjs[current.key].forEach((workflow, _, arr) => {
    let copy = JSON.parse(JSON.stringify(current))
    copy.key = workflow.destination
    if (!workflow.char && !workflow.compare && !workflow.num) {
      copy = getOppositeMinMax(arr, copy)
    } else if (workflow.compare === '<' && copy.ranges[workflow.char].max > workflow.num) {
      copy.ranges[workflow.char].max = workflow.num - 1
      current.ranges[workflow.char].min = workflow.num - 1
    } else if (workflow.compare === '>' && copy.ranges[workflow.char].min < workflow.num) {
      copy.ranges[workflow.char].min = workflow.num
      current.ranges[workflow.char].max = workflow.num
    }
    nodes.push(copy)
  })
  return walkTree(nodes, results)
}

// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()
const [tempWorkflows, tempParts] = fileContent.split(/\n\n/)
const workflows = tempWorkflows.split(/\n/)

// PART 1
// interface PartObj { [key: string]: number }
// const parts = tempParts.split(/\n/).filter(line => line)
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

const workflowObjs: { [key: string]: WorkFlowObj[] } = {};
workflows.forEach(workflow => {
  [...workflow.matchAll(/(\w+){(.+)}/g)].map(match => {
    const [fullMatch, name, constraints] = match
    workflowObjs[name] = constraints.split(',').map(constraint => {
      const match = constraint.match(/([xmas])([><])(\d*):(\w+)/)
      if (match === null) {
        return {
          char: '',
          compare: '',
          num: 0,
          destination: constraint,
        }
      }
      const [fullMatch, char, compare, num, destination] = match;
      return {
        char,
        compare,
        num: Number(num),
        destination,
      }
    })
  })
})

const total = (
  walkTree([{
    allKeys: [],
    key: 'in',
    ranges: {
      x: { min: 0, max: 4000, },
      m: { min: 0, max: 4000, },
      a: { min: 0, max: 4000, },
      s: { min: 0, max: 4000, },
    },
  }]).reduce((total, acceptedItem) => {
    return total + Object.keys(acceptedItem.ranges).map(char => {
      return acceptedItem.ranges[char].max - acceptedItem.ranges[char].min;
    }).reduce((total, num) => total * num);
  }, 0)
);

console.log(total);
console.log(total === 134370637448305 || total === 167409079868000);

// ANSWER PART 1: 489392
// ANSWER PART 2: 134370637448305
