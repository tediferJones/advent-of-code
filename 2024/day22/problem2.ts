const moduleVal = 16777216n
function mixAndPrune(secret: bigint, result: bigint) {
  return (secret ^ result) % moduleVal
}

const nextSecret: ((secret: bigint) => bigint)[] = [
  (secret) => mixAndPrune(secret, secret * 64n),
  (secret) => mixAndPrune(secret, secret / 32n),
  (secret) => mixAndPrune(secret, secret * 2048n),
];

function getNthSecret(secret: bigint, num: number) {
  return Array(num).fill(0).reduce((secret) => {
    return nextSecret.reduce((secret, func) => {
      return func(secret)
    }, secret)
  }, secret)
}

function getLastDigit(num: bigint) {
  const str = num.toString()
  return Number(str[str.length - 1])
}

function getBananas(secret: bigint, num: number) {
  const bananas: number[] = []
  Array(num).fill(0).reduce((secret: bigint) => {
    const tempSecret = nextSecret.reduce((secret, func) => {
      return func(secret)
    }, secret)
    bananas.push(getLastDigit(tempSecret))
    return tempSecret
  }, secret)
  return bananas
}

function getDiffs(arr: number[]) {
  return arr.slice(1).map((num, i) => num - arr[i])
}

const startTime = Bun.nanoseconds();
const secrets = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(BigInt)
)

const part1 = secrets.reduce((total, num) => total + getNthSecret(num, 2000), 0n)
console.log(part1, [ 37327623n, 20332089158n ].includes(part1))

const changesMap: { [key: string]: number } = {}
secrets.forEach(num => {
  const set = new Set<string>()
  const changes = getBananas(num, 2000)
  changes.slice(4).forEach((_, i) => {
    const temp = changes.slice(i, i + 5)
    const diffs = getDiffs(temp).join()
    if (set.has(diffs)) return
    set.add(diffs)
    if (!changesMap[diffs]) changesMap[diffs] = 0
    changesMap[diffs] += temp[temp.length - 1]
  })
})
const part2 = Object.values(changesMap).toSorted((a, b) => b - a)[0]
console.log(part2, [ 23, 2191 ].includes(part2))
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9} seconds`)
