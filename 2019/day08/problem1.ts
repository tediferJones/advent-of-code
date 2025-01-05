type Position = { row: number, col: number }

function getFrames(data: number[], frameSize: Position, frames: number[][][] = []) {
  if (data.length === 0) return frames;
  const totalSize = frameSize.row * frameSize.col;
  const slice = data.slice(0, totalSize);
  console.log(slice.length)
  const frame = [ ...Array(frameSize.row).keys() ].map(i => {
    return slice.slice(frameSize.col * i, frameSize.col * (i + 1))
  });
  return getFrames(data.slice(totalSize), frameSize, frames.concat([ frame ]))
}

function solvePart1(frames: number[][][]) {
  const leastZeros = frames.reduce((lowestIndex, frame, i) => {
    const count = frame.flat().filter(num => num === 0).length
    if (count < lowestIndex.count) {
      return { count, index: i }
    }
    return lowestIndex
  }, { count: Infinity, index: -1 })
  const onesCount = frames[leastZeros.index].flat().filter(num => num === 1).length
  const twosCount = frames[leastZeros.index].flat().filter(num => num === 2).length
  return onesCount * twosCount
}

const frameSize = {
  'example.txt': { row: 2, col: 3 },
  'example2.txt': { row: 2, col: 2 },
  'inputs.txt': { row: 6, col: 25 },
}[process.argv[2]]
if (!frameSize) throw Error('could not find frame size for file')

const data = (await Bun.file(process.argv[2]).text()).split('').slice(0, -1).map(Number)

const frames = getFrames(data, frameSize)
const part1 = solvePart1(frames)
console.log(part1, [ 1, 2975 ].includes(part1))
