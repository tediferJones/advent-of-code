type Position = { row: number, col: number }
type PathState = { pos: Position, steps: number, level: number }

const directions = {
  right: { row:  0, col:  1 },
  down: { row: -1, col:  0 },
  left: { row:  0, col: -1 },
  up: { row:  1, col:  0 },
}

function charAtPos(grid: string[][], pos: Position): string | undefined {
  return grid?.[pos.row]?.[pos.col];
}

function setPos(grid: string[][], pos: Position, char: string) {
  grid[pos.row][pos.col] = char;
}

function translatePos(pos: Position, dir: Position) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col,
  }
}

function posAtChar(grid: string[][], char: string) {
  const row = grid.findIndex(row => row.includes(char));
  if (row === -1) throw Error(`cant find char, ${char}`);
  const col = grid[row].findIndex(cell => cell === char);
  return { row, col };
}

function findManyChar(grid: string[][], char: string) {
  return grid.reduce((found, row, i) => {
    return found.concat(
      row.reduce((miniFound, cell, j) => {
        if (cell === char) return miniFound.concat({ row: i, col: j });
        return miniFound;
      }, [] as Position[])
    );
  }, [] as Position[]);
}

function isPortal(char: string) {
  return 'A' <= char && char <= 'Z';
}

function findPortal(grid: string[][], label: Position[]) {
  const [ pos1, pos2 ] = label;
  const diff = {
    row: Math.abs(pos1.row - pos2.row),
    col: Math.abs(pos1.col - pos2.col),
  }
  if (diff.row !== 0) {
    // vertical
    const low = Math.min(pos1.row, pos2.row);
    const lowPos = { row: low - 1, col: pos1.col };
    if (charAtPos(grid, lowPos) === '.') return lowPos;
    const high = Math.max(pos1.row, pos2.row);
    const highPos = { row: high + 1, col: pos1.col };
    if (charAtPos(grid, highPos) === '.') return highPos;
    throw Error('failed to find label pos');
  }
  if (diff.col !== 0) {
    // horizontal
    const low = Math.min(pos1.col, pos2.col);
    const lowPos = { row: pos1.row, col: low - 1 };
    if (charAtPos(grid, lowPos) === '.') return lowPos;
    const high = Math.max(pos1.col, pos2.col);
    const highPos = { row: pos1.row, col: high + 1 };
    if (charAtPos(grid, highPos) === '.') return highPos;
    throw Error('failed to find label pos');
  }
  throw Error('failed to find label pos');
}

function reformatMaze(originalGrid: string[][]) {
  const usedPos = new Set<string>();
  const grid: string[][] = JSON.parse(JSON.stringify(originalGrid));
  grid.forEach((row, i) => {
    const portals = row.map((_, i) => i).filter(i => isPortal(row[i]));
    portals.forEach(col => {
      const pos = { row: i, col };
      if (usedPos.has(JSON.stringify(pos))) return;
      const downPos = translatePos(pos, directions.down);
      if (isPortal(charAtPos(grid, downPos) || '')) {
        // use vertical to find entrance/exit
        // read label top to bottom
        const label = [ downPos, pos ];
        const entrance = findPortal(grid, label);
        label.concat(entrance)
          .map(pos => JSON.stringify(pos))
          .forEach(strPos => usedPos.add(strPos));
        setPos(grid, entrance, label.map(pos => charAtPos(grid, pos)).join(''));
        return;
      }
      const rightPos = translatePos(pos, directions.right);
      if (isPortal(charAtPos(grid, rightPos) || '')) {
        // use horizontal to find entrance/exit
        // read label left to right
        const label = [ pos, rightPos ];
        const entrance = findPortal(grid, [ pos, rightPos ]);
        label.concat(entrance)
          .map(pos => JSON.stringify(pos))
          .forEach(strPos => usedPos.add(strPos));
        setPos(grid, entrance, label.map(pos => charAtPos(grid, pos)).join(''));
        return;
      }
    });
  });

  // trim edges, and fill inside with '#'
  return grid.slice(2, -2).map(row => row.slice(2, -2)).map(row => {
    return row.map(char => {
      return [ '#', '.' ].includes(char) || char.length === 2 ? char : '#';
    });
  });
}

function isInnerTeleporter(grid: string[][], pos: Position) {
  return Object.values(directions).every(dir => {
    const newPos = translatePos(pos, dir);
    return charAtPos(grid, newPos);
  });
}

function pathFinder(
  grid: string[][],
  queue: PathState[],
  mode: 'part1' | 'part2',
  visited = new Set<String>(
    queue.map(state => `${JSON.stringify(state.pos)},${state.level}`)
  ),
) {
  if (!queue.length) return;
  const current = queue.shift()!;
  const currChar = charAtPos(grid, current.pos)!;
  if (currChar === 'ZZ') {
    if (current.level === 0) return current.steps;
    return pathFinder(grid, queue, mode, visited);
  }
  if (currChar === 'AA' && current.level !== 0) {
    return pathFinder(grid, queue, mode, visited);
  }
  if (currChar !== '.' && currChar !== 'AA') {
    const teleporterPositions = findManyChar(grid, currChar);
    const newPos = JSON.parse(
      teleporterPositions
      .map(pos => JSON.stringify(pos))
      .filter(posStr => posStr !== JSON.stringify(current.pos))
      [0]
    );
    const teleType = isInnerTeleporter(grid, current.pos);
    current.pos = newPos;
    current.steps++;
    if (mode === 'part2') current.level = current.level + (teleType ? 1 : -1);
    if (current.level < 0) return pathFinder(grid, queue, mode, visited);
  }
  Object.values(directions).forEach(dir => {
    const nextPos = translatePos(current.pos, dir);
    const nextChar = charAtPos(grid, nextPos);
    if (!nextChar || nextChar === '#') return;
    const nextPosStr = `${JSON.stringify(nextPos)},${current.level}`;
    if (visited.has(nextPosStr)) return;
    visited.add(nextPosStr);
    queue.push({
      pos: nextPos,
      steps: current.steps + 1,
      level: current.level
    });
  });
  return pathFinder(grid, queue, mode, visited);
}

const startTime = Bun.nanoseconds();
const originalMaze = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(line => line.split(''))
);

// reformatting the maze is literally the hardest part of this problem
const usableMaze = reformatMaze(originalMaze);

const start = posAtChar(usableMaze, 'AA');
const startState = { pos: start, steps: 0, level: 0 };

const part1 = pathFinder(usableMaze, [ startState ], 'part1')!;
console.log(part1, [ 23, 58, 676 ].includes(part1));

const part2 = pathFinder(usableMaze, [ startState ], 'part2')!;
console.log(part2, [ 26, 396, 7732 ].includes(part2));

console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`);
