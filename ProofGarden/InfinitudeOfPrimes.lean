import ProofGarden.Defs
import ProofGarden.Lemmas.Factorial
import ProofGarden.Lemmas.PrimeFactor

/-!
# Euclid: there are infinitely many primes

However large a number `n` you pick, there is a prime bigger than it.
(Any prime factor of `n! + 1` works: it cannot be ≤ `n`, since those all divide `n!`.)
-/

namespace ProofGarden

/-- For every `n` there is a prime `p` with `n < p`. -/
theorem infinitely_many_primes (n : Nat) : ∃ p, n < p ∧ IsPrime p := by
  sorry

end ProofGarden
