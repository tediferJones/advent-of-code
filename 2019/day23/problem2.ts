import { runOnce } from '../intCode';

type State = ReturnType<typeof runOnce>

function iterateStates(
  states: State[],
  func255: (input1: number, input2: number) => any
) {
  states.some((state, i) => {
    if (state.diagnostics.length === 3) {
      const [ target, input1, input2 ] = state.diagnostics.slice(-3);
      if (target === 255) {
        const result = func255(input1, input2);
        if (result) return result;
      } else {
        states[target].input.push(input1, input2);
      }
      state.diagnostics = [];
    }
    if (state.input.length === 0) state.input.push(-1);
    states[i] = runOnce(state);
  });
}

function solvePart1(states: State[], answer = 0) {
  iterateStates(states, (_, input2) => answer = input2);
  if (answer) return answer;
  return solvePart1(states, answer);
}

// need to track last two to check for three in a row
const prevY = [ NaN, NaN ];
function solvePart2(states: State[], nat: number[]) {
  const isIdle = states.every(state => {
    return state.input.length === 0 || state.input.every(num => num === -1);
  });
  if (nat.length && isIdle) {
    // console.log('Is idle, send from NAT', nat);
    if (prevY.every(prev => prev === nat[1])) return nat[1];
    prevY.shift();
    prevY.push(nat[1]);
    states[0].input = nat;
    nat = [];
  }

  iterateStates(states, (input1, input2) => {
    nat = [ input1, input2 ];
    return;
  });

  return solvePart2(states, nat);
}

const program = (await Bun.file(process.argv[2]).text()).split(/,/).map(Number);

const states = Array(50).fill(0).map((_, i) => {
  return {
    program,
    index: 0,
    input: [ i ],
    diagnostics: [],
    halt: false,
    relativeBase: 0,
    done: false,
  }
});

const startTime = Bun.nanoseconds();
const part1 = solvePart1(states);
console.log(part1, [ 24602 ].includes(part1));

// its not the packet that is sent two times in a row
// its actually the packet that is sent three time in a row
const part2 = solvePart2(states, []);
console.log(part2, [ 19641 ].includes(part2));
console.log(`TIME: ${(Bun.nanoseconds() - startTime) / 10**9}`);
