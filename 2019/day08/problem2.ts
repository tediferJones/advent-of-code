type Position = { row: number, col: number }

function buildFrame(
  data: number[],
  size: number,
  frame: number[][] = []
) {
  if (data.length === 0) return frame;
  return buildFrame(
    data.slice(size),
    size,
    frame.concat([ data.slice(0, size) ])
  );
}

function getFrames(
  data: number[],
  frameSize: Position,
  frames: number[][][] = []
) {
  if (data.length === 0) return frames;
  return getFrames(
    data.slice(frameSize.row * frameSize.col),
    frameSize,
    frames.concat([
      buildFrame(data.slice(0, frameSize.row * frameSize.col), frameSize.col)
    ])
  );
}

function solvePart1(frames: number[][][]) {
  return frames.reduce((lowest, frame) => {
    const counts = frame.flat().reduce((counts, num) => {
      return counts.with(num, counts[num]++);
    }, [ 0, 0, 0 ]);
    if (counts[0] > lowest.zeroCount) return lowest;
    return { zeroCount: counts[0], result: counts[1] * counts[2] };
  }, { zeroCount: Infinity, result: 0 }).result;
}

function solvePart2(frames: number[][][], frameSize: Position) {
  return Array(frameSize.row).fill(0).map((_, i) => {
    return Array(frameSize.col).fill(0).map((_, j) => {
      return frames.find(frame => frame[i][j] !== 2)![i][j];
    });
  });
}

function prettyPrintFrame(frame: number[][]) {
  frame.forEach(row => {
    const formatted = row.map(cell => cell === 0 ? ' ' : '█');
    console.log(formatted.join(''));
  });
}

const frameSize = {
  'example.txt': { row: 2, col: 3 },
  'example2.txt': { row: 2, col: 2 },
  'inputs.txt': { row: 6, col: 25 },
}[process.argv[2]];
if (!frameSize) throw Error('could not find frame size for file');

const data = (
  (await Bun.file(process.argv[2]).text())
  .split('')
  .slice(0, -1)
  .map(Number)
);

const frames = getFrames(data, frameSize);
const part1 = solvePart1(frames);
console.log(part1, [ 1, 2975 ].includes(part1));

const part2 = solvePart2(frames, frameSize);
prettyPrintFrame(part2); // should display EHRUE
