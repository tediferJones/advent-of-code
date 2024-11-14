type Pulse = 'hi' | 'lo'
type Modules = { [key: string]: (FlipFlop | Conjunction | Broadcaster) }
type PulseState = { from: string, to: string, type: Pulse }

class FlipFlop {
  recipients: string[];
  name: string;
  isOn: boolean;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
    this.isOn = false;
  }

  receivePulse(modules: AllModules, type: Pulse) {
    if (type === 'hi') return;
    this.isOn = !this.isOn;
    const sendPulse = this.isOn ? 'hi' : 'lo'
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
    })
  }
}

class Conjunction {
  recipients: string[];
  senders: { [key: string]: Pulse };
  name: string;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.senders = {};
    this.name = name;
  }

  allHigh() {
    return Object.keys(this.senders).every(name => this.senders[name] === 'hi');
  }

  receivePulse(modules: AllModules, type: Pulse, sender: string) {
    this.senders[sender] = type;
    const sendPulse = this.allHigh() ? 'lo' : 'hi'
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
    })
  }
}

class Broadcaster {
  recipients: string[];
  name: string;
  constructor(recipients: string[], name: string) {
    this.recipients = recipients;
    this.name = name;
  }

  receivePulse(modules: AllModules, type: Pulse) {
    this.recipients.forEach(recipient => {
      modules.pulseQueue.push({ from: this.name, type, to: recipient })
    })
  }
}

class AllModules {
  modules: Modules;
  count: { hi: number, lo: number };
  pulseQueue: PulseState[];

  constructor() {
    this.modules = {};
    this.count = { hi: 0, lo: 0 };
    this.pulseQueue = [];
  }

  linkConjunctions() {
    // We want to get all the nodes that are connected to each conjunction
    // This function can almost certainly be improved and/or merged into building of the initial this.modules object
    const conjunctions = Object.keys(this.modules).filter(key => {
      return this.modules[key].constructor.name === 'Conjunction'
    })
    // console.log('CONJUNCTIONS', conjunctions)

    Object.keys(this.modules).forEach(key => {
      conjunctions.forEach(conj => {
        if (this.modules[key].recipients.includes(conj)) {
          (this.modules[conj] as Conjunction).senders[key] = 'lo'
        }
      })
    })
  }

  pushBtn(pushCount = Infinity, initialPulse?: PulseState, desiredResult?: Omit<PulseState, 'to'>) {
    let count = 0
    while (count < pushCount) {
      this.pulseQueue = [ initialPulse || { from: 'button', type: 'lo', to: 'broadcaster' } ]
      count++
      while (this.pulseQueue.length) {
        const item = this.pulseQueue.shift()!;
        // console.log(`${item.from} -${item.type}-> ${item.to}`);
        if (item.from === desiredResult?.from && item.type === desiredResult?.type) {
          return count
        }
        this.count[item.type]++;
        this.modules[item.to]?.receivePulse(this, item.type, item.from);
      }
      if (count % 100000 === 0) console.log(count.toLocaleString())
    }
  }

  traceBranch(initialPulse: { start: string, end: string, type: Pulse }) {
    return this.pushBtn(
      Infinity, 
      { from: 'broadcaster', to: initialPulse.start, type: 'lo' },
      { from: initialPulse.end, type: initialPulse.type }
    )
  }

  findConjunction(start: string): string | undefined {
    if (this.modules[start].constructor.name === 'Conjunction') {
      return start;
    }
    for (const next of this.modules[start].recipients) {
      return this.findConjunction(next)
    }
  }
}

// Get GCD using Euclidean algorithm
function gcd(a: number, b: number): number {
  return b !== 0 ? gcd(b, a % b) : a
}

// Get LCM of two numbers
function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}

// Get LCM of an array of numbers
function lcmOfArray(arr: number[]) {
  return arr.reduce((acc, num) => lcm(acc, num), 1);
}

const startTime = Bun.nanoseconds();
// const fileContent = await Bun.file('example.txt').text();
// const fileContent = await Bun.file('example2.txt').text();
const fileContent = await Bun.file('inputs.txt').text();
const allMods = new AllModules();

fileContent
  .split(/\n/)
  .filter(line => line)
  .forEach(line => {
    const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
    const recipients = recipientStr.split(', ')
    if (type === '%') {
      allMods.modules[name] = new FlipFlop(recipients, name);
    } else if (type === '&') {
      allMods.modules[name] = new Conjunction(recipients, name);
    } else if (name === 'broadcaster') {
      allMods.modules[name] = new Broadcaster(recipients, name);
    }
  });
allMods.linkConjunctions();

// Use this output with https://csacademy.com/app/graph_editor/, to visualize the graph
// const visData = fileContent
//   .split(/\n/)
//   .filter(line => line)
//   .map(line => {
//     const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
//     const recipients = recipientStr.split(', ')
//     return recipients.map(recipient => `${name} ${recipient}`)
//   });
// console.log(visData.flat().join('\n'))

// console.log(lcmOfArray([ 4007, 4027, 3917, 3919 ]))
// FIND LCM OF 4007, 4027, 3917, and 3919
// How did we get here?
//  1.) visualize graph of your input and determine the start and end of each cluster of the graph
//      - In our case, all nodes that are immediate descendants of the broadcaster, are the starts of all our clusters
//      - The end of each cluster is the first conjunction module we can find (within each cluster)
//      - also need to determine number of conjunctions between end and xr (this determines the type of pulse end needs to send)
//  2.) once the start and end of each cluster has been determined we must find the number of button presses that will result in a lo pulse being sent to the end node
//  3.) the result for each cluster should result in the numbers listed above, from there just find the LCM and hope that it is the right answer

// console.log(allMods)

// const answer = lcmOfArray(
//   [
//     { start: 'ns', end: 'ck', type: 'lo' },
//     { start: 'pj', end: 'cs', type: 'lo' },
//     { start: 'xz', end: 'dx', type: 'lo' },
//     { start: 'sg', end: 'jh', type: 'lo' },
//   ].map(state => allMods.traceBranch(
//       state as { start: string, end: string, type: Pulse }
//     ) as number)
// )

const answer = lcmOfArray(
  allMods.modules['broadcaster'].recipients.map(start => {
    const end = allMods.findConjunction(start)
    if (!end) throw Error('couldnt find conjunction')
    return allMods.traceBranch({ start, end, type: 'lo' })
  }) as number[]
)

// allMods.pushBtn(1000);
// const answer = allMods.count.hi * allMods.count.lo;
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`);
console.log(
  [ 919383692, 247702167614647 ].includes(answer),
  answer,
)

// Time to brute force
// (() => {
//   const sampleCount = 1000000
//   const start = Bun.nanoseconds();
//   allMods.pushBtn(sampleCount);
//   const end = Bun.nanoseconds();
//   const time = (end - start) / 10**9
//   const totalSeconds = (247702167614647 / sampleCount) * time 
//   console.log(`${totalSeconds / 60 / 60 / 24 / 365.25} years`)
// })()

// ANSWER PART 1: 919383692
// ANSWER PART 2: 247702167614647
