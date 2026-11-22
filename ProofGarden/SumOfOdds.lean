import ProofGarden.Defs

/-!
# The first n odd numbers add up to n²

`1 + 3 + 5 + ... + (2n - 1) = n²`. Picture each odd number as an L-shaped
layer wrapped around a square.
-/

namespace ProofGarden

/-- `1 + 3 + ... + (2n - 1) = n * n`. -/
theorem sum_of_odds (n : Nat) : sumRange n (fun i => 2 * i + 1) = n * n := by
  sorry

end ProofGarden
