AOC 2019

Advent of code? No, advent of bad instructions

This year was um... weird. The problems weren't really that challenging, just very
poorly explained. The intCode problems left an especially poor taste in my mouth.
For the most part I feel that these problems were probably more fun to make than
to solve.

I did enjoy the space theme of this year, and the way some of the problems actually
related to the theme.

The Good Ones:
- Day 16, fake FFT, I was stuck on part 2 of this problem but it eventually clicked.
Realizing the pattern that for the second half of the digits, the first half will
be all 0s and the seconds half all 1s was the key to solving this problem efficiently.

- Day 18, maze solving with keys. This was probably my favorite problem of the entire
year. Luckily I had just done AOC 2024 day 21, which requires similar types of
optimizations. It took me a while to see that I could do all the path finding initially.
The fact that this puzzle was inspired by Link to the Past Randomizer Multiworld,
is just a bonus.

- Day 19, the intCode beam puzzle. This was one of the only intCode puzzles that
didn't make me want to rip my hair out. In the end, it just came down to a clever
application of binary search.

- Day 20, the donut maze. This one wasn't really a big challenge but I thought it
was an interesting/unique twist on the typical AOC maze solving problems. Formatting
the input data was by far the hardest part of this problem.

The Annoying Ones:
- Day 17, this problem wasn't actually too bad, but just exceedingly annoying and
way too involved for what it was (250 LOC). I'm still not sure if the path with
the least turns is always the right answer, but that was the case for me, and using
that little hack was the only way I could get the runtime under 1 second.

- Day 21, I feel like this problem was supposed to be a gimme, but not being able
to see the entire map just made this problem absurdly annoying. You'll fix one
situation and then you have no idea if the next failure point is before or after
the previous one, which makes it really difficult to determine if you're actually
making progress or not. This also seems like a generally poorly designed problem,
either I got really lucky or there is a single set of instructions that can solve
all maps.

- Day 22, after reading the description I was originally pretty excited for this
problem, but after struggling to even solve part 1 with equations I eventually gave
up on solving this problem on my own and essentially had to follow a guide to even
understand how to approach this problem. In the end I did learn a bit about function
composition and binary exponentiation.

- Day 23, I still feel as tho the instructions were a lie on this one. The answer
was not the packet sent to the NAT twice in a row, it was the packet sent three
times in a row. In addition, the fact that I had to redesign my entire intCode
interpreter for this problem was just irritating. Also doing this problem asynchronously
and recursively seems impossible without overflowing the call stack (at least in
JavaScript).
