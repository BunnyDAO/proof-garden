import ProofGarden.Defs

/-!
# Lemma: every number ≥ 2 has a prime factor

The smallest divisor of `n` that is at least 2 is prime.
-/

namespace ProofGarden

/-- Every natural number `n ≥ 2` is divisible by some prime. -/
theorem exists_prime_factor {n : Nat} (h : 2 ≤ n) : ∃ p, IsPrime p ∧ p ∣ n := by
  sorry

end ProofGarden
