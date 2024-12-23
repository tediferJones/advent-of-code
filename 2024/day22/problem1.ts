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

const part1 = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
  .map(BigInt)
  .reduce((total, num) => total + getNthSecret(num, 2000), 0n)
)
console.log(part1, [ 37327623n, 20332089158n ].includes(part1))
