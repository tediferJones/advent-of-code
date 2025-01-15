import runIntCode from '../day13/intCode'

function drawMap(output: number[]) {
  return  output.reduce((map, tile) => {
    if (tile === 10) {
      map.push([])
    } else {
      map[map.length - 1].push(String.fromCharCode(tile))
    }
    return map
  }, [[]] as string[][])
}

function solvePart1(map: string[][]) {
  return map.reduce((intersections, row, i) => {
    return intersections + row.reduce((miniTotal, cell, j) => {
      if (cell !== '#') return miniTotal
      if (map?.[i - 1]?.[j] !== '#') return miniTotal
      if (map?.[i + 1]?.[j] !== '#') return miniTotal
      if (map?.[i]?.[j - 1] !== '#') return miniTotal
      if (map?.[i]?.[j + 1] !== '#') return miniTotal
      // console.log('intersection at', i, j)
      return miniTotal + (i * j)
    }, 0)
  }, 0)
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number)

const result = runIntCode(program)

const map = drawMap(result.diagnostics)
map.forEach(row => console.log(row.join('')))

const part1 = solvePart1(map)
console.log(part1, [ 8084 ].includes(part1))
