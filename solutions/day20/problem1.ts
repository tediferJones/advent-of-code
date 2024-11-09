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

  receivePulse(type: Pulse) {
    if (type === 'hi') return;
    this.isOn = !this.isOn;
    const sendPulse = this.isOn ? 'hi' : 'lo'
    this.recipients.forEach(recipient => {
      allMods.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
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

  receivePulse(type: Pulse, sender: string) {
    this.senders[sender] = type;
    const allHigh = Object.keys(this.senders).every(name => this.senders[name] === 'hi');
    const sendPulse = allHigh ? 'lo' : 'hi'
    this.recipients.forEach(recipient => {
      allMods.pulseQueue.push({ from: this.name, type: sendPulse, to: recipient })
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

  receivePulse(type: Pulse) {
    this.recipients.forEach(recipient => {
      allMods.pulseQueue.push({ from: this.name, type, to: recipient })
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

  pushBtn() {
    const sender = 'broadcaster';
    (this.modules[sender] as Broadcaster).recipients.forEach(recipient => {
      this.pulseQueue.push({ from: sender, type: 'lo', to: recipient })
    })

    while (this.pulseQueue.length) {
      const item = this.pulseQueue.shift();
      if (!item) return console.log('queue is empty')
      console.log(`${item.from} --${item.type}--> ${item.to}`)
      // Pass 'this' to all receivePulse calls, that way receivePulse funcs dont have to refer to the global var for allMods
      this.modules[item.to].receivePulse(item.type, item.from)
    }
  }
}

const fileContent = await Bun.file('example.txt').text();
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
    } else {
      allMods.modules[name] = new Broadcaster(recipients, name);
    }
  });

console.log(allMods)
allMods.pushBtn();
console.log(allMods)
