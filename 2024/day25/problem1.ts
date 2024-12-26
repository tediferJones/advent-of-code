type SchematicType = 'locks' | 'keys'
type Schematics = {
  [key in SchematicType] : number[][]
} & { max: number }

function rotateArray(arr: string[][]) {
  return arr[0].reduce((result, _, i) => {
    return result.concat([ arr.map(row => row[i]) ])
  }, [] as string[][])
}

function getPinLengths(arr: string[][]) {
  return arr.map(row => row.filter(char => char === '#').length)
}

function testKeyLockFit(key: number[], lock: number[], maxLength: number) {
  return key.every((pin, i) => pin + lock[i] <= maxLength)
}

const schematics = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n\n/)
  .map(schematic => schematic.split(/\n/).filter(Boolean).map(line => line.split('')))
  .reduce((schematics, schematic) => {
    const isLock = schematic[0].filter(char => char === '#').length === schematic[0].length;
    const data = isLock ? schematic.slice(1) : schematic.slice(0, -1);
    const pinLengths = getPinLengths(rotateArray(data));
    schematics[isLock ? 'locks' : 'keys'].push(pinLengths);
    schematics.max = data[0].length
    return schematics
  }, { locks: [], keys: [], max: 0 } as Schematics)
)

const part1 = schematics.locks.reduce((total, lock) => {
  return total + schematics.keys.reduce((miniTotal, key) => {
    return miniTotal + Number(testKeyLockFit(key, lock, schematics.max))
  }, 0)
}, 0)

console.log(part1, [ 3, 2933 ].includes(part1))
