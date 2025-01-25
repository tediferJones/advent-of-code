function modInverse(a: bigint, m: bigint): bigint {
  let m0 = m, t: bigint, q: bigint;
  let x0 = BigInt(0), x1 = BigInt(1);

  if (m === BigInt(1)) return BigInt(0);

  while (a > BigInt(1)) {
    // q is quotient
    q = a / m;
    t = m;

    // m is remainder now, process same as Euclid's algorithm
    m = a % m;
    a = t;
    t = x0;

    x0 = x1 - q * x0;
    x1 = t;
  }

  // Make x1 positive
  if (x1 < BigInt(0)) x1 += m0;

  return x1;
}

function modularExponentiation(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base = base % mod;

  while (exp > BigInt(0)) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp >> BigInt(1); // Divide exp by 2
    base = (base * base) % mod;
  }

  return result;
}

function shuffle(cards: bigint, shuffles: string[], target: bigint, times: bigint): bigint {
  let a = BigInt(1); // a = slope?
  let b = BigInt(0); // b = offset?

  for (const shuffle of shuffles) {
    if (shuffle.startsWith("cut")) {
      const n = BigInt(parseInt(shuffle.split(" ")[1]));
      b = (b - n + cards) % cards;
    } else if (shuffle.startsWith("deal with increment")) {
      const n = BigInt(parseInt(shuffle.split(" ")[3]));
      a = (a * modInverse(n, cards)) % cards;
      b = (b * modInverse(n, cards)) % cards;
    } else if (shuffle.startsWith("deal into new stack")) {
      a = -a;
      b = (b - BigInt(1)) % cards;
    }
  }

  // Now we have a and b for one shuffle
  // We need to apply this transformation `times` times
  const aFinal = modularExponentiation(a, times, cards);
  const bFinal = (b * (1n - modularExponentiation(a, times, cards) + cards) * modInverse(1n - a + cards, cards)) % cards;

  // Find the position of the target card
  return (aFinal * target + bFinal) % cards;
}

// Example usage
const cards = BigInt(119315717514047);
const targetCard = BigInt(2020);
const times = BigInt(101741582076661);

const shuffleOrder = (
  (await Bun.file(process.argv[2]).text())
  .split(/\n/)
  .filter(Boolean)
)

const result = shuffle(cards, shuffleOrder, targetCard, times);
console.log(`The position of card ${targetCard} is: ${result}`);
