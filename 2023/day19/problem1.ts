// const fileContent = await Bun.file('example.txt').text()
const fileContent = await Bun.file('inputs.txt').text()

const [tempWorkflows, tempParts] = fileContent.split(/\n\n/)
const parts = tempParts.split(/\n/).filter(line => line)
const workflows = tempWorkflows.split(/\n/)

interface PartObj {
  [key: string]: number
}

const partObjs: { [key: string]: number }[] = [];
parts.map(part => {
  const partObj: { [key: string]: number } = {};
  const match = part.match(/{(.+)}/)
  if (!match) throw Error('COULDNT EXTRACT WORKFLOW')
  match[1].split(',').forEach(str => {
    const [letter, number] = str.split('=')
    partObj[letter] = Number(number)
  })
  partObjs.push(partObj)
})

const workflowObjs: { [key: string]: Function[] } = {};
workflows.forEach(workflow => {
  const match = workflow.match(/(\w+){(.+)}/)
  if (!match) throw Error('COULDNT EXTRACT WORKFLOW')
  const name = match[1]
  const constraints = match[2]
  const workFlowFuncs: Function[] = [];
  constraints.split(',').forEach(constraint => {
    const match = constraint.match(/([xmas])([><])(\d*):(\w+)/)
    if (match === null) {
      workFlowFuncs.push(
        () => constraint
      )
      return
    }
    if (!match) throw Error('COULDNT EXTRACT CONSTRAINT FROM WORKFLOW')
    const [fullMatch, char, compare, num, destination] = match;
    if (compare === '>') {
      workFlowFuncs.push(
        (partObj: PartObj) => {
          // console.log(destination)
          // console.log(partObj, char)
          return partObj[char] > Number(num) ? destination : ''
        }
      )
    }
    if (compare === '<') {
      workFlowFuncs.push(
        (partObj: PartObj) => {
          return partObj[char] < Number(num) ? destination : ''
        }
      )
    }
  })
  workflowObjs[name] = workFlowFuncs
})
// console.log(workflowObjs)
// console.log(partObjs)
// console.log('TEST', workflowObjs['in'][0](partObjs[0]))

function tracePartPath(part: PartObj, workFlowName = 'in') {
  if (workFlowName === 'R' || workFlowName === 'A') {
    return workFlowName
  }
  let nextLocation = '';
  workflowObjs[workFlowName].some(func => {
    const result = func(part)
    if (result) {
      nextLocation = result
    }
    return result;
  })
  return tracePartPath(part, nextLocation)
}

const accepted: number[] = [];
partObjs.forEach((part, i) => {
  const partResult = tracePartPath(part)
  if (partResult === 'A') {
    accepted.push(i)
  }
})

let total = 0;
accepted.forEach(i => {
  const part = partObjs[i]
  for (const key in part) {
    total += part[key]
  }
})
console.log(total)

// ANSWER PART 1: 489392
