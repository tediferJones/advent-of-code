# advent-of-code-2023

# Structure
- Each day gets its own folder in `solutions/` that will contain `problem1.ts` and `problem2.ts`
    - These files will contain solutions for part 1 and part 2 respectively
- Some folder will contain `p2v2.ts` or `final.ts`, 
    - These are typically refactored and simplfied versions of `problem2.ts`
    - Most of these can solve both part 1 and part 2

# Stats
<center>

Under 24 hours: ✔ 
Over 24 hours: ✱ 
Not attempted:  ✘ 

| Day    |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |  9  | 10  |
| :---   | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Part 1 |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |
| Part 2 |  ✔  |  ✔  |  ✔  |  ✔  |  ✱  |  ✔  |  ✔  |  ✔  |  ✔  |  ✱  |

| Day    | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  | 20  |
| :---   | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Part 1 |  ✔  |  ✱  |  ✱  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✘  |
| Part 2 |  ✔  |  ✱  |  ✱  |  ✔  |  ✔  |  ✔  |  ✔  |  ✔  |  ✱  |  ✘  |

| Day    | 21  | 22  | 23  | 24  | 25  |
| :---   | :-: | :-: | :-: | :-: |  -: |
| Part 1 |  ✔  |  ✔  |  ✔  |  ✘  |  ✘  |
| Part 2 |  ✱  |  ✔  |  ✱  |  ✘  |  ✘  |

<hr>

</center>

# The interesting ones
- __Day 9__ showed me the beauty of functional programming
- __Day 11__ was note worthy, a little math can save a lot of CPU cycles
- __Day 12__ showed me the amazing power of memoization
- __Day 14__ taught me about recognizing and handling repeating cycles
- __Day 18__, learned about Pick's theorem, very interesting stuff
- __Day 22__, handling intersections with 3D coordinates was a first for me

# The difficult ones
- __Day 7 part 2__, accounting for jokers proved to be more difficult than expected
- __Day 10 part 2__, I had no idea how to approach this problem until after day 18 where I learned about Pick's theorem
- __Day 12__, I was stuck on this one for a while, but I learned a lot about dynamic programming and memoization
- __Day 13__, reading comprehension is hard, once I realized the reflection must touch an edge it wasn't too bad 
- __Day 17__, had to learn about djikstra's algorithm, it's essentially just sorted brute force
- __Day 19 part 2__, understanding how to approach this problem took some time but after that it wasn't too bad
- __Day 21 part 2__, I think this one was the hardest, I would have never figured out that this could be solved with quadratic equations on my own
- __Day 23 part 2__, determining the longest path is hard, but graph theory and depth-first search save the day once again
