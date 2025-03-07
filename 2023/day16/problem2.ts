interface Cursor {
  dir: 'right' | 'left' | 'up' | 'down',
  col: number,
  row: number,
}

const dirLookUp = {
  right: [0, 1],
  left: [0, -1],
  up: [-1, 0],
  down: [1, 0],
}

const charLookUp: { [key: string]: Function } = {
  '|': (currentState: Cursor, states: Cursor[]) => {
    if (currentState.dir === 'right' || currentState.dir === 'left') {
      currentState.dir = 'down'
      states.push({
        ...currentState,
        dir: 'up',
        col: currentState.col + dirLookUp['up'][1],
        row: currentState.row + dirLookUp['up'][0],
      })
      // currentState.col = currentState.col + dirLookUp[currentState.dir][1]
      // currentState.row = currentState.row + dirLookUp[currentState.dir][0]
      return true
    }
  },
  '-': (currentState: Cursor, states: Cursor[]) => {
    if (currentState.dir === 'down' || currentState.dir === 'up') {
      currentState.dir = 'left'
      states.push({
        ...currentState,
        dir: 'right',
        col: currentState.col + dirLookUp['right'][1],
        row: currentState.row + dirLookUp['right'][0],
      })
      return true
    }
  },
  '/': (currentState: Cursor, states: Cursor[]) => {
    if (currentState.dir === 'down' || currentState.dir === 'right') {
      // console.log('SETTING DIR')
      currentState.dir = (currentState.dir === 'down' ? 'left' : 'up')
      // console.log(currentState)
      return true
    }
    if (currentState.dir === 'up' || currentState.dir === 'left') {
      currentState.dir = (currentState.dir === 'up' ? 'right' : 'down')
      return true
    }
  },
  '\\': (currentState: Cursor, states: Cursor[]) => {
    if (currentState.dir === 'down' || currentState.dir === 'left') {
      currentState.dir = (currentState.dir === 'down' ? 'right' : 'up')
      return true
    }
    if (currentState.dir === 'up' || currentState.dir === 'right') {
      currentState.dir = (currentState.dir === 'up' ? 'left' : 'down')
      return true
    }
  },
}

function makeMoveV2(lines: string[][], states: Cursor[], usedLocations: string[] = []) {
  if (states.length === 0) {
    return usedLocations
  }
  for (let i = 0; i < states.length; i++) {
    const state = states[i]
    const [curY, curX] = [state.row, state.col]
    if (!lines[curY] || !lines[curY][curX]) {
      states.splice(states.indexOf(state), 1);
      continue;
    }
    const currentChar = lines[curY][curX]
    const stringified = JSON.stringify([curY, curX])
    if (usedLocations.includes(stringified)) {
      if ('|-'.includes(currentChar)) {
        states.splice(states.indexOf(state), 1)
        continue
      }
    } else {
      usedLocations.push(stringified)
    }

    if (charLookUp[currentChar]) {
      charLookUp[currentChar](state, states)
    }
    
    state.col = state.col + dirLookUp[state.dir][1]
    state.row = state.row + dirLookUp[state.dir][0]
  }
  return makeMoveV2(lines, states, usedLocations);
}

// const fileContent = await Bun.file('example.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
const lines = fileContent
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

// const start: Cursor = {
//   dir: 'right',
//   col: 0,
//   row: 0,
// }

// const usedLocations = makeMoveV2(lines, [start])
// console.log('ANSWER: ', usedLocations.length)

let allStarts: Cursor[] = [];
allStarts = allStarts.concat(lines.map((row, i) => {
  return {
    dir: 'right',
    col: 0,
    row: i,
  }
}))
allStarts = allStarts.concat(lines.map((row, i) => {
  return {
    dir: 'left',
    col: lines.length - 1,
    row: i,
  }
}))
allStarts = allStarts.concat(lines[0].map((col, i) => {
  return {
    dir: 'down',
    col: i,
    row: 0,
  }
}))
allStarts = allStarts.concat(lines[0].map((col, i) => {
  return {
    dir: 'up',
    col: i,
    row: lines[0].length - 1,
  }
}))

console.log(allStarts)

let best = 0;
let counter = 0;
for (const start of allStarts) {
  console.log(++counter, ' of ', allStarts.length)
  const result = makeMoveV2(lines, [start]).length;
  if (result > best) {
    best = result;
  }
}
console.log(best)

// ANSWER PART 1: 7477
// ANSWER PART 2: 7853

// for (const line of lines) {
//   console.log(line)
// }
// console.log('\n\n\n')
// 
// usedLocations.forEach((str, i) => {
//   const [y, x] = JSON.parse(str)
//   lines[y][x] = '#'
//   // lines[y][x] = `${i}`
// })
// 
// for (const line of lines) {
//   console.log(line)
// }
