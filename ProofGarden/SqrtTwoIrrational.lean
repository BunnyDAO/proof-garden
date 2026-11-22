import ProofGarden.Lemmas.Parity

/-!
# √2 is irrational

There is no fraction `p / q` whose square is exactly 2. Stated without real
numbers: no natural numbers `p` and `q ≠ 0` satisfy `p² = 2q²`.
-/

namespace ProofGarden

/-- There are no natural numbers `p, q` with `q ≠ 0` and `p * p = 2 * q * q`. -/
theorem sqrt_two_irrational : ¬ ∃ p q : Nat, q ≠ 0 ∧ p * p = 2 * q * q := by
  sorry

end ProofGarden
