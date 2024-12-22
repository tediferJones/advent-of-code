type Position = { row: number, col: number }

const directions: { [key: string]: Position } = {
  '^': { row: -1, col: 0 },
  '>': { row: 0, col: 1 },
  'v': { row: 1, col: 0 },
  '<': { row: 0, col: -1 }
}

const numpad = [
  [ '7', '8', '9' ],
  [ '4', '5', '6' ],
  [ '1', '2', '3' ],
  [ undefined, '0', 'A' ]
]

const dirpad = [
  [ undefined, '^', 'A' ],
  [ '<', 'v', '>' ]
]

function posToStr(pos: Position) {
  return `${pos.row},${pos.col}`
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col
  }
}

function charAtPos(grid: (string|undefined)[][], pos: Position) {
  return grid?.[pos.row]?.[pos.col]
}

function getPath(grid: (string | undefined)[][], start: Position, end: Position) {
  const queue = [{ ...start, path: '' }]
  // const seen = new Set<string>(queue.map(posToStr))
  const endStr = posToStr(end)
  // const answers: any[] = []
  while (queue.length) {
    const current = queue.shift()!
    if (current.path.length > 3) continue
    if (posToStr(current) === endStr) {
      return current
      // answers.push(current)
      // continue
    }
    Object.keys(directions).forEach(key => {
      const dir = directions[key]
      const newPos = translatePos(current, dir)
      if (!charAtPos(grid, newPos)) return
      // if (seen.has(posToStr(newPos))) return
      // seen.add(posToStr(newPos))
      queue.push({ ...newPos, path: current.path + key })
    })
  }
  // return answers
}

// somehow this is still the closest to the right answer
// see problem1.ts for more details on how this function 'should' work
function shortestPath(
  // grid: (string | undefined)[][],
  // pos: Position,
  rowDiff: number,
  colDiff: number,
  keypresses = '',
) {
  if (colDiff > 0) {
    keypresses += '<'.repeat(colDiff)
  }
  if (colDiff < 0) {
    keypresses += '>'.repeat(Math.abs(colDiff))
  }
  if (rowDiff > 0) {
    keypresses += '^'.repeat(rowDiff)
  }
  if (rowDiff < 0) {
    keypresses += 'v'.repeat(Math.abs(rowDiff))
  }
  return keypresses
}

function getComplexity(numStr: string) {
  const numPos = { row: 3, col: 2 }
  const dir1Pos = { row: 0, col: 2 }
  const dir2Pos = { row: 0, col: 2 }
  // essentially we need to get all possible paths for step1,
  // then for each of those, solve step2, creating another bunch of paths
  // then for each of those, solve step3, creating even more paths
  // once we have all possible step3 paths, just pick the shortest
  //
  // possible hint: shortest path might just be the path with the most repeated characters

  const step1 = numStr.split('').reduce((path, char) => {
    const row = numpad.findIndex(row => row.includes(char))
    const col = numpad[row].findIndex(cell => cell === char)
    const result = getPath(numpad, numPos, { row, col })!
    numPos.row = result.row
    numPos.col = result.col
    return path + result.path + 'A'
  }, '')
  console.log(step1)
  const step2 = step1.split('').reduce((path, char) => {
    const row = dirpad.findIndex(row => row.includes(char))
    const col = dirpad[row].findIndex(cell => cell === char)
    const result = getPath(dirpad, dir1Pos, { row, col })!
    dir1Pos.row = result.row
    dir1Pos.col = result.col
    return path + result.path + 'A'
  }, '')
  console.log(step2)
  const step3 = step2.split('').reduce((path, char) => {
    const row = dirpad.findIndex(row => row.includes(char))
    const col = dirpad[row].findIndex(cell => cell === char)
    const result = getPath(dirpad, dir2Pos, { row, col })!
    dir2Pos.row = result.row
    dir2Pos.col = result.col
    return path + result.path + 'A'
  }, '')
  console.log(step3)
  console.log(step3.length)
}
getComplexity("029A")
