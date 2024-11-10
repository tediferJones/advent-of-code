// We need to count the number of hi pulses and lo pulses separately
// the final answer is the product of hi pulse count times lo pulse count

type Pulse = 'hi' | 'lo'
type Modules = { [key: string]: (FlipFlop | Conjunction | Broadcaster) }

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

  receivePulse(modules: AllModules, type: Pulse, sender: string) {
    this.senders[sender] = type;
    const allHigh = Object.keys(this.senders).every(name => this.senders[name] === 'hi');
    const sendPulse = allHigh ? 'lo' : 'hi'
    // console.log('all High:', allHigh, this.senders)
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
  pulseQueue: { from: string, to: string, type: Pulse }[];

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
    console.log(conjunctions)

    Object.keys(this.modules).forEach(key => {
      conjunctions.forEach(conj => {
        if (this.modules[key].recipients.includes(conj)) {
          (this.modules[conj] as Conjunction).senders[key] = 'lo'
        }
      })
    })
  }

  pushBtn(pushCount: number) {
    let count = 0
    while (count < pushCount) {
      this.pulseQueue = [ { from: 'button', type: 'lo', to: 'broadcaster' } ]
      while (this.pulseQueue.length) {
        const item = this.pulseQueue.shift();
        if (!item) return console.log('queue is empty');
        console.log(`${item.from} -${item.type}-> ${item.to}`);
        this.count[item.type]++;
        this.modules[item.to]?.receivePulse(this, item.type, item.from);
      }
      count++
      console.log('DONE WITH BUTTON PUSH:', count)
    }
  }
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

console.log(allMods)
allMods.linkConjunctions()
// allMods.pushBtn(1);
allMods.pushBtn(1000);
console.log(allMods)
const answer = allMods.count.hi * allMods.count.lo;
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`)
console.log(`ANSWER: ${answer}`)
console.log(answer === 919383692)

// ANSWER PART 1: 919383692
