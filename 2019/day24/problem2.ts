type Position = { row: number, col: number }

const directions = [
  { row:  0, col:  1 },
  { row:  1, col:  0 },
  { row:  0, col: -1 },
  { row: -1, col:  0 },
]

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function charAtPos(map: string[][], pos: Position): string | undefined {
  return map?.[pos.row]?.[pos.col]
}

function passTime(map: string[][]) {
  return map.map((row, i) => {
    return row.map((cell, j) => {
      const pos = { row: i, col: j }
      const adjBugCount = directions.map(dir => {
        const adjPos = translatePos(pos, dir)
        return charAtPos(map, adjPos) === '#'
      }).filter(Boolean).length

      if (cell === '#') {
        return adjBugCount === 1 ? '#' : '.'
      }
      if (cell === '.') {
        return 0 < adjBugCount && adjBugCount < 3 ? '#' : '.'
      }
      throw Error(`Char '${cell}' cannot be processed`)
    })
  })
}

function findRepeatMap(map: string[][], cache = new Set<string>) {
  const mapStr = JSON.stringify(map)
  if (cache.has(mapStr)) return map
  return findRepeatMap(passTime(map), cache.add(mapStr))
}

function calcBiodiversity(map: string[][]) {
  return map.flat().reduce((rating, cell, i) => {
    return cell === '#' ? rating + 2**i : rating
  }, 0)
}

function createNewLevel() {
  return Array(5).fill(0).map(() => Array(5).fill('.'))
}

function passTimeRec(recMap: RecMap, maxTime: number, time = 0) {
  // inner grids have positive index
  // outer grids have negative index
  //
  // we actually have to modify recMap

  console.log('TIME', time)
  Object.keys(recMap).toSorted((a, b) => Number(a) - Number(b)).forEach(levelStr => {
    console.log(levelStr)
    printMap(recMap[Number(levelStr)])
  })
  const newRecMap = JSON.parse(JSON.stringify(recMap))
  if (time === maxTime) return recMap
  Object.keys(recMap).forEach(levelStr => {
    const level = Number(levelStr)
    // const map = recMap[level]
    recMap[level].map((row, i) => {
      return row.map((cell, j) => {
        const pos = { row: i, col: j }
        if (pos.row === 2 && pos.col === 2) return cell

        // should probably be reduce,
        // we can return more elements than dirs if dir leads to different level
        const tempAdjBugCount = directions.reduce((cells, dir) => {
          const adjPos = translatePos(pos, dir)
          if (adjPos.row === 2 && adjPos.col === 2) {
            // use level + 1
            if (!recMap[level + 1]) {
              recMap[level + 1] = createNewLevel()
              newRecMap[level + 1] = createNewLevel()
            }
            if (pos.row === 1) {
              if (pos.col !== 2) throw Error('wrong position')
              return cells.concat(recMap[level + 1][0].map(cell => cell === '#'))
            }
            if (pos.row === 3) {
              if (pos.col !== 2) throw Error('wrong position')
              return cells.concat(recMap[level + 1][4].map(cell => cell === '#'))
            }
            if (pos.col === 1) {
              if (pos.row !== 2) throw Error('wrong position')
              const col = recMap[level + 1].map(row => row[0])
              return cells.concat(col.map(cell => cell === '#'))
            }
            if (pos.col === 3) {
              if (pos.row !== 2) throw Error('wrong position')
              const col = recMap[level + 1].map(row => row[4])
              return cells.concat(col.map(cell => cell === '#'))
            }
            throw Error('error handling inner grid')
          }
          // const adjChar = charAtPos(map, adjPos)
          const adjChar = charAtPos(recMap[level], adjPos)
          if (!adjChar) {
            if ((adjPos.row === 5) || (adjPos.row === -1)) {
              if ((adjPos.col === 5) || (adjPos.col === -1)) {
                throw Error('outer grid corner case')
              }
            }
            console.log('ADJ POS', adjPos)
            // use level - 1
            if (!recMap[level - 1]) {
              recMap[level - 1] = createNewLevel()
              newRecMap[level - 1] = createNewLevel()
            }
            if (adjPos.row === -1) {
              return cells.concat(recMap[level - 1][1][2] === '#')
            }
            if (adjPos.row === 5) {
              return cells.concat(recMap[level - 1][3][2] === '#')
            }
            if (adjPos.col === -1) {
              return cells.concat(recMap[level - 1][2][1] === '#')
            }
            if (adjPos.col === 5) {
              return cells.concat(recMap[level - 1][2][3] === '#')
            }
            throw Error('error handling outer grid')
          }
          return cells.concat(adjChar === '#')
        }, [] as boolean[])

        // console.log(tempAdjBugCount.length)
        if (tempAdjBugCount.length !== 4) {
          if (tempAdjBugCount.length !== 8) {
            throw Error('too many checks')
          }
        }
        const adjBugCount = tempAdjBugCount.filter(Boolean).length

        if (cell === '#') {
          const resultChar = (adjBugCount === 1 ? '#' : '.')
          newRecMap[level][pos.row][pos.col] = resultChar
          return
        }
        if (cell === '.') {
          const resultChar = (0 < adjBugCount && adjBugCount < 3 ? '#' : '.')
          newRecMap[level][pos.row][pos.col] = resultChar
          return
        }
        throw Error(`Char '${cell}' cannot be processed`)
      })
    })
  })

  return passTimeRec(newRecMap, maxTime, time + 1)
}

function passTimeRecV2(recMap: RecMap, maxTime: number, time = 0) {
  Object.keys(recMap).toSorted((a, b) => Number(a) - Number(b)).forEach(levelStr => {
    console.log(levelStr)
    printMap(recMap[Number(levelStr)])
  })
  console.log('END')
  if (time === maxTime) return recMap
  const newRecMap = JSON.parse(JSON.stringify(recMap))
  Object.keys(recMap).forEach(levelStr => {
    const level = Number(levelStr)
    recMap[level].forEach((row, i) => {
      row.forEach((cell, j) => {
        const pos = { row: i, col: j }
        if (pos.row === 2 && pos.col === 2) return cell
        const adjBugCount = directions.reduce((cells, dir) => {
          const adjPos = translatePos(pos, dir)

          if (adjPos.row === 2 && adjPos.col === 2) {
            // check inner map
            // inner map is positive
            if (!recMap[level + 1]) recMap[level + 1] = createNewLevel()
            if (!newRecMap[level + 1]) newRecMap[level + 1] = createNewLevel()

            if (pos.row === 1 && pos.col === 2) {
              return cells.concat(recMap[level + 1][0].map(cell => cell === '#'))
            }
            if (pos.row === 3 && pos.col === 2) {
              return cells.concat(recMap[level + 1][4].map(cell => cell === '#'))
            }
            if (pos.row === 2 && pos.col === 1) {
              const col = recMap[level + 1].map(row => row[0])
              return cells.concat(col.map(cell => cell === '#'))
            }
            if (pos.row === 2 && pos.col === 3) {
              const col = recMap[level + 1].map(row => row[4])
              return cells.concat(col.map(cell => cell === '#'))
            }
            throw Error('failed to proccess inner map')
          }

          const adjChar = charAtPos(recMap[level], adjPos)
          if (!adjChar) {
            // check outer map
            // outer map is negative
            if (!recMap[level - 1]) recMap[level - 1] = createNewLevel()
            if (!newRecMap[level - 1]) newRecMap[level - 1] = createNewLevel()
            if (adjPos.row === -1) {
              return cells.concat(recMap[level - 1][1][2] === '#')
            }
            if (adjPos.row === 5) {
              return cells.concat(recMap[level - 1][3][2] === '#')
            }
            if (adjPos.col === -1) {
              return cells.concat(recMap[level - 1][2][1] === '#')
            }
            if (adjPos.col === 5) {
              return cells.concat(recMap[level - 1][2][3] === '#')
            }
            throw Error('failed to process outer map')
          }

          return cells.concat(charAtPos(map, adjPos) === '#')
        }, [] as boolean[]).filter(Boolean).length

        if (cell === '#') {
          newRecMap[level][pos.row][pos.col] = (adjBugCount === 1 ? '#' : '.')
          return
        }
        if (cell === '.') {
          newRecMap[level][pos.row][pos.col] = (0 < adjBugCount && adjBugCount < 3 ? '#' : '.')
          return
        }
        throw Error(`Char '${cell}' cannot be processed`)
      })
    })
  })
  return passTimeRecV2(newRecMap, maxTime, time + 1)
}

function passTimeRecV3(recMap: RecMap, maxTime: number, time: number = 0) {
  Object.keys(recMap).toSorted((a, b) => Number(a) - Number(b)).forEach(levelStr => {
    console.log(levelStr)
    printMap(recMap[Number(levelStr)])
  })
  if (time === maxTime) return recMap
  const newMap = JSON.parse(JSON.stringify(recMap))
  const levels = Object.keys(recMap).map(Number)
  const minLevel = Math.min(...levels)
  const maxLevel = Math.max(...levels)
  if (!recMap[maxLevel + 1]) {
    recMap[maxLevel + 1] = createNewLevel()
    newMap[maxLevel + 1] = createNewLevel()
  }
  if (!recMap[minLevel - 1]) {
    recMap[minLevel - 1] = createNewLevel()
    newMap[minLevel - 1] = createNewLevel()
  }
  Object.keys(recMap).forEach(levelStr => {
    const level = Number(levelStr)
    recMap[level].forEach((row, i) => {
      row.forEach((cell, j) => {
        const pos = { row: i, col: j }
        if (pos.row === 2 && pos.col === 2) {
          // skip this check, this 'tile' represents the inner grid
          return
        }

        // check all adj tiles,
        // if adj tile is out of bounds, check outer map (level - 1), total of 4 possibilities
        // if adj tile is { row: 2, col: 2 }, check inner map (level + 1), total of 8 possibilites

        const adjCells = directions.reduce((cells, dir) => {
          const adjPos = translatePos(pos, dir)
          if (adjPos.row === 2 && adjPos.col === 2) {
            // check inner map
            if (!recMap[level + 1]) {
              // throw Error('should have already made new levels')
              recMap[level + 1] = createNewLevel()
              newMap[level + 1] = createNewLevel()
            }
            if (pos.row === 1) {
              return cells.concat(recMap[level + 1][0])
            } else if (pos.row === 3) {
              return cells.concat(recMap[level + 1][4])
            } else if (pos.col === 1) {
              return cells.concat(recMap[level + 1].map(row => row[0]))
            } else if (pos.col === 3) {
              return cells.concat(recMap[level + 1].map(row => row[4]))
            }
            throw Error('failed to handle inner map')
          }
          const adjChar = charAtPos(recMap[level], adjPos)
          if (!adjChar) {
            if (!recMap[level - 1]) {
              // throw Error('should have already made new levels')
              recMap[level - 1] = createNewLevel()
              newMap[level - 1] = createNewLevel()
            }
            // check outer map
            if (adjPos.row === -1) {
              return cells.concat(recMap[level - 1][1][2])
            } else if (adjPos.row === 5) {
              return cells.concat(recMap[level - 1][3][2])
            } else if (adjPos.col === -1) {
              return cells.concat(recMap[level - 1][2][1])
            } else if (adjPos.col === 5) {
              return cells.concat(recMap[level - 1][2][3])
            }
            throw Error('failed to handle outer map')
          }
          // if we make it here, its just a normal compare
          return cells.concat(adjChar)
        }, [] as string[])

        const bugCount = adjCells.filter(cell => cell === '#').length
        if (cell === '#') {
          newMap[level][pos.row][pos.col] = (bugCount === 1 ? '#' : '.')
        } else if (cell === '.') {
          newMap[level][pos.row][pos.col] = (0 < bugCount && bugCount < 3 ? '#' : '.')
        } else {
          throw Error('cant handle char')
        }
      })
    })
  })
  return passTimeRecV3(newMap, maxTime, time + 1)
}

function countRecMap(recMap: RecMap) {
  const allMaps = Object.keys(recMap).map(levelStr => {
    const level = Number(levelStr)
    return recMap[level].flat()
  })
  return allMaps.flat().filter(char => char === '#').length
}

function printMap(map: string[][]) {
  map.forEach(row => console.log(row.join('')))
  console.log()
}

const map = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
)

// const part1 = calcBiodiversity(findRepeatMap(map))
// console.log(part1, [ 2129920, 18371095 ].includes(part1))

type RecMap = Record<number, string[][]>
const recMap: RecMap = { 0: map }
// this one seems to actually work
// it generates way too many maps, but we can fix that later
const resultMap = passTimeRecV3(recMap, 10)
console.log(countRecMap(resultMap))

// const newRecMap = passTimeRec(recMap, 10)
// console.log('bug count', countRecMap(newRecMap))
// const newRecMapV2 = passTimeRecV2(recMap, 10)
// console.log(countRecMap(newRecMapV2))
// printMap(newRecMap[0])
// printMap(newRecMapV2[0])
