// HOW TO SOLVE PART 2
//
// Visualize the graph of all modules (this helps a lot)
// Our input has 4 branches, the recipients of the broadcaster node marks the start of each branch
// The end of each branch can be found by looking for the first conjunction module on a given branch
// For each branch find the number of button presses (starting at the start node) to return a low pulse from the end node
//   - We can infer from the visualized graph that each branch's end node must return a low pulse to it's next node
// Once we have the number of button pushes for each branch, we just find the LCM of these numbers
// Example for our input:
//  - { start: 'ns', end: 'ck', type: 'lo' } = 4007
//  - { start: 'pj', end: 'cs', type: 'lo' } = 4027
//  - { start: 'xz', end: 'dx', type: 'lo' } = 3917
//  - { start: 'sg', end: 'jh', type: 'lo' } = 3919
//
// In short:
//   - break the problem up into smaller parts, only worry about one branch at a time
//   - Solve the parts individually, and determine the answer from there by finding the LCM
//   - LCM indicates the point at which all branches are cycled to the correct position to allow xr to receive a low pulse

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

  async buildModules(fileName: string) {
    (await Bun.file(fileName).text())
      .split(/\n/)
      .filter(line => line)
      .forEach(line => {
        const [ match, type, name, recipientStr ] = line.match(/([%&]?)(\w+|broadcaster) -> (.+)/) || []
        const recipients = recipientStr.split(', ')
        if (type === '%') {
          this.modules[name] = new FlipFlop(recipients, name);
        } else if (type === '&') {
          this.modules[name] = new Conjunction(recipients, name);
        } else if (name === 'broadcaster') {
          this.modules[name] = new Broadcaster(recipients, name);
        }
      });
    this.linkConjunctions();
  }

  linkConjunctions() {
    // We want to get all the nodes that are connected to each conjunction
    // This function can almost certainly be improved and/or merged into building of the initial this.modules object
    const conjunctions = Object.keys(this.modules).filter(key => {
      return this.modules[key].constructor.name === 'Conjunction'
    })

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
    while (!pushCount || count < pushCount) {
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

  solvePart1() {
    this.pushBtn(1000);
    return this.count.hi * this.count.lo;
  }

  solvePart2() {
    return lcmOfArray(
      allMods.modules['broadcaster'].recipients.map(start => {
        const end = allMods.findConjunction(start)
        if (!end) throw Error('couldnt find conjunction')
        return allMods.traceBranch({ start, end, type: 'lo' })
      }) as number[]
    )
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
const allMods = new AllModules();
// await allMods.buildModules('example.txt');
// await allMods.buildModules('example2.txt');
await allMods.buildModules('inputs.txt');

// const answer = allMods.solvePart1();
const answer = allMods.solvePart2();
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`);
console.log(
  [ 919383692, 247702167614647 ].includes(answer),
  answer,
);

// ANSWER PART 1: 919383692
// ANSWER PART 2: 247702167614647

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
