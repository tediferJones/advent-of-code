// expand initial data and get all locations
// Get all unique pairs
// Get shortest distance between each pair
// ANSWER = sum of all distances

function getEmptyIndices(map: string[][]) {
  return {
    rows: map
      .map((row, i) => row.includes('#') ? -1 : i)
      .filter(i => i > -1),
    // Scan every line at given index, break if we see # symbol
    cols: [...Array(map[0].length).keys()]
      .map((i) => map.some(line => line[i] === '#') ? -1 : i)
      .filter(i => i > -1)
  };
}

function getLocations(map: string[][]) {
  return map.map((line, row) => {
    return line.map((char, col) => {
      return char === '#' ? [row, col] : [];
    }).filter(char => char.length)
  }).filter(line => line.length)
    .flat();
}

function getUnqPairs(locations: number[][]) {
  return locations.map((a, i) => {
    return locations.map((b, j) => {
      return i > locations.length - 2 || j <= i ? [] : [a,b]
    }).filter(pair => pair.length)
  }).filter(line => line.length)
    .flat();
}

function getShortestPath(pair: number[][], emptyIndices: { rows: number[], cols: number[] }) {
  const [a, b] = [pair[0], pair[1]];
  const [yMin, yMax] = a[0] < b[0] ? [a[0], b[0]] : [b[0], a[0]];
  const [xMin, xMax] = a[1] < b[1] ? [a[1], b[1]] : [b[1], a[1]];
  const emptyCounter = [
    { indices: emptyIndices.rows, min: yMin, max: yMax },
    { indices: emptyIndices.cols, min: xMin, max: xMax },
  ].map(opt => opt.indices
    .filter((i: number) => opt.min < i && i < opt.max)
    .length
  ).reduce((total, num) => total + num);
  const expansionFactor = 10**6;
  
  return (yMax - yMin) + (xMax - xMin) - 
    emptyCounter + (emptyCounter * expansionFactor);
}

// const map = (await Bun.file('example.txt').text())
const map = (await Bun.file('inputs.txt').text())
  .split(/\n/)
  .filter(line => line)
  .map(line => line.split(''));

const emptyIndices = getEmptyIndices(map);
console.log(
  getUnqPairs(getLocations(map))
    .reduce((total, pair) => {
      return total += getShortestPath(pair, emptyIndices)
    }, 0) === 827009909817
);

// ANSWER: 827009909817
