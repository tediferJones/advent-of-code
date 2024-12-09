type Position = { row: number, col: number }

function getAllFrequencies(data: string[][]) {
  return [ ...data.reduce((set, row) => {
    return row.reduce((set, cell) => cell !== '.' ? set.add(cell) : set, set);
  }, new Set<string>()) ];
}

function getAllPosForFreq(data: string[][], frequency: string) {
  return data.reduce((arr, row, i) => {
    return arr.concat(row.reduce((miniArr, cell, j) => {
      return cell === frequency ? miniArr.concat({ row: i, col: j }) : miniArr;
    }, [] as Position[]));
  }, [] as Position[]);
}

function getAllCombos(arr: Position[]) {
  return arr.reduce((combos, pos1, i) => {
    return combos.concat(arr.slice(i + 1).map(pos2 => [ pos1, pos2 ]));
  }, [] as [Position, Position][]);
}

function getInBoundsFunc(data: string[][]) {
  return (pos: Position) => {
    return 0 <= pos.row && pos.row < data.length &&
      0 <= pos.col && pos.col < data[pos.row].length;
  }
}

function walkPath(
  pos: Position,
  posMod: (pos: Position) => Position,
  inBoundsFunc: (pos: Position) => boolean,
  result: Position[] = [],
): Position[] {
  if (!inBoundsFunc(pos)) return result;
  return walkPath(posMod(pos), posMod, inBoundsFunc, result.concat(pos));
}

function getAntiNodes(
  pos1: Position,
  pos2: Position,
  inBoundsFunc: (pos: Position) => boolean,
  type: 'part1' | 'part2'
) {
  const diff: Position = { row: pos1.row - pos2.row, col: pos1.col - pos2.col };
  const [ func1, func2 ] = [
    (pos: Position) => ({ row: pos.row + diff.row, col: pos.col + diff.col }),
    (pos: Position) => ({ row: pos.row - diff.row, col: pos.col - diff.col }),
  ];
  if (type === 'part1') return [ func1(pos1), func2(pos2) ].filter(inBoundsFunc);
  return walkPath(pos1, func1, inBoundsFunc)
    .concat(walkPath(pos2, func2, inBoundsFunc));
}

function solve(data: string[][]) {
  const isInBounds = getInBoundsFunc(data);
  return getAllFrequencies(data).reduce((answer, frequency) => {
    return getAllCombos(getAllPosForFreq(data, frequency)).reduce((answer, combo) => {
      getAntiNodes(...combo, isInBounds, 'part1')
        .reduce((set, pos) => set.add(`${pos.row},${pos.col}`), answer.part1);
      getAntiNodes(...combo, isInBounds, 'part2')
        .reduce((set, pos) => set.add(`${pos.row},${pos.col}`), answer.part2);
      return answer;
    }, answer);
  }, { part1: new Set<string>(), part2: new Set<string>() });
}

const data = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
);

const startTime = Bun.nanoseconds();
const { part1, part2 } = solve(data);
console.log(part1.size, [ 14, 273 ].includes(part1.size));
console.log(part2.size, [ 34, 1017 ].includes(part2.size));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);

// ANSWER PART 1: 273
// ANSWER PART 2: 1017
