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
    if (curY === 6 && curX === 6) {
      console.log('BEFORE')
      console.log(state, currentChar)
    }
    const stringified = JSON.stringify([curY, curX])
    if (usedLocations.includes(stringified)) {
      // console.log('ALREADY BEEN HERE')
      if ('|-'.includes(currentChar)) {
        // console.log('ALREADY WALKED THIS LINE')
        // console.log(currentChar, 'BREAKING')
        states.splice(states.indexOf(state), 1)
        continue
      }
    } else {
      usedLocations.push(stringified)
    }

    if (charLookUp[currentChar]) {
      // if (usedLocations.includes(stringified)) {
      //   if ('|-'.includes(currentChar)) {
      //     states.splice(states.indexOf(state), 1)
      //     continue;
      //   }
      // }
      if (charLookUp[currentChar](state, states)) {
        // console.log('new state: ', state)
        // if (curY === 6 && curX === 6) {
        //   console.log('FUNCTION RETURNED TRUE')
        // }
      }
    }
    
    if (curY === 6 && curX === 6) {
      console.log('AFTER')
      console.log(state, currentChar)
    }
    state.col = state.col + dirLookUp[state.dir][1]
    state.row = state.row + dirLookUp[state.dir][0]
  }
  return makeMoveV2(lines, states, usedLocations);
}

// function makeMove(lines: string[][], states: Cursor[], usedLocations: string[] = []) {
//   // console.log('CALLED AGAIN')
//   // console.log(states)
//   if (states.length === 0) {
//     return usedLocations
//   }
//   // for (const state of states) {
//   for (let i = 0; i < states.length; i++) {
//     const state = states[i]
//     const [curY, curX] = [state.row, state.col]
// 
//     if (!lines[curY] || !lines[curY][curX] ||
//       ('|-/\\'.includes(lines[curY][curX]) &&
//         usedLocations.includes(JSON.stringify([curY, curX])))
//     ) {
//       console.log('END OF STATE')
//       states.splice(states.indexOf(state), 1)
//       // return
//       continue
//     }
// 
//     console.log(state, states.length)
//     const currentChar = lines[curY][curX]
//     // state.col = state.col + dirLookUp[state.dir][1]
//     // state.row = state.row + dirLookUp[state.dir][0]
//     // lines[curY][curX] = '#'
//     const stringified = JSON.stringify([curY, curX])
//     if (!usedLocations.includes(stringified)) {
//       usedLocations.push(stringified)
//     }
//     if (currentChar === '|' &&
//       (state.dir === 'right' || state.dir === 'left')
//     ) {
//       state.dir = 'down'
//       states.push({
//         ...state,
//         dir: 'up',
//         col: state.col + dirLookUp['up'][1],
//         row: state.row + dirLookUp['up'][0],
//       })
//       state.col = state.col + dirLookUp[state.dir][1]
//       state.row = state.row + dirLookUp[state.dir][0]
//       continue;
//     }
// 
//     if (currentChar === '-' &&
//       (state.dir === 'down' || state.dir === 'up')
//     ) {
//       state.dir = 'left' 
//       states.push({
//         ...state,
//         dir: 'right',
//         col: state.col + dirLookUp['right'][1],
//         row: state.row + dirLookUp['right'][0],
//       })
//       state.col = state.col + dirLookUp[state.dir][1]
//       state.row = state.row + dirLookUp[state.dir][0]
//       continue;
//     }
// 
//     if (currentChar === '/') {
//       // console.log('REFLECTOR')
//       // console.log(state)
//       if (state.dir === 'down' || state.dir === 'right') {
//         // console.log('SETTING DIR')
//         state.dir = (state.dir === 'down' ? 'left' : 'up')
//         state.col = state.col + dirLookUp[state.dir][1]
//         state.row = state.row + dirLookUp[state.dir][0]
//         // console.log(state)
//         continue;
//       }
//       if (state.dir === 'up' || state.dir === 'left') {
//         state.dir = (state.dir === 'up' ? 'right' : 'down')
//         state.col = state.col + dirLookUp[state.dir][1]
//         state.row = state.row + dirLookUp[state.dir][0]
//         continue;
//       }
//       // console.log('NEW STATE', state)
//     }
// 
//     if (currentChar === '\\') {
//       if (['down', 'left'].includes(state.dir)) {
//         state.dir = (state.dir === 'down' ? 'right' : 'up')
//         state.col = state.col + dirLookUp[state.dir][1]
//         state.row = state.row + dirLookUp[state.dir][0]
//         continue;
//       }
//       if (['up', 'right'].includes(state.dir)) {
//         state.dir = (state.dir === 'up' ? 'left' : 'down')
//         state.col = state.col + dirLookUp[state.dir][1]
//         state.row = state.row + dirLookUp[state.dir][0]
//         continue;
//       }
//     }
// 
//     // console.log(currentChar)
//     // if (!'.#\\'.includes(currentChar) && charLookUp[currentChar](state, states)) {
//     //   state.col = state.col + dirLookUp[state.dir][1]
//     //   state.row = state.row + dirLookUp[state.dir][0]
//     // }
//     state.col = state.col + dirLookUp[state.dir][1]
//     state.row = state.row + dirLookUp[state.dir][0]
//     // for (const line of lines) {
//     //   console.log(line)
//     // }
//     // console.log('\n')
//   }
//   return makeMove(lines, states, usedLocations);
// }

// const fileContent = await Bun.file('example.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
console.log(fileContent)
const lines = fileContent
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''))

const start: Cursor = {
  dir: 'right',
  col: 0,
  row: 0,
}

// console.log(makeMove(lines, [start]))
const usedLocations = makeMoveV2(lines, [start])
console.log('ANSWER: ', usedLocations.length)

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

// ANSWER PART 1: 7477
