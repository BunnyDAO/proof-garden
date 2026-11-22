import ProofGarden.Defs

/-!
# Neighbouring Fibonacci numbers are coprime

Two consecutive Fibonacci numbers never share a factor bigger than 1. Running
Euclid's algorithm on them just walks the sequence back down to `fib 1 = 1`.
-/

namespace ProofGarden

/-- `gcd (fib n) (fib (n + 1)) = 1` for every `n`. -/
theorem fib_coprime_succ (n : Nat) : Nat.gcd (fib n) (fib (n + 1)) = 1 := by
  sorry

end ProofGarden
