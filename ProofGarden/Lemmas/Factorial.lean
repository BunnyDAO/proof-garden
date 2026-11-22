import ProofGarden.Defs

/-!
# Lemma: facts about the factorial

Two small facts Euclid's proof needs: `n!` is never zero, and every number
from 1 to `n` divides `n!`.
-/

namespace ProofGarden

/-- The factorial of any number is positive. -/
theorem fact_pos (n : Nat) : 0 < fact n := by
  sorry

/-- Every `k` with `1 ≤ k ≤ n` divides `n!`. -/
theorem dvd_fact {k n : Nat} (h₁ : 1 ≤ k) (h₂ : k ≤ n) : k ∣ fact n := by
  sorry

end ProofGarden
