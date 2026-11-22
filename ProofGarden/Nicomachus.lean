import ProofGarden.Defs

/-!
# Nicomachus's theorem

The sum of the first cubes is the square of the sum of the first numbers:
`1³ + 2³ + ... + n³ = (1 + 2 + ... + n)²`.
-/

namespace ProofGarden

/-- `0³ + 1³ + ... + n³ = (0 + 1 + ... + n)²`. -/
theorem nicomachus (n : Nat) :
    sumRange (n + 1) (fun i => i ^ 3) = (sumRange (n + 1) (fun i => i)) ^ 2 := by
  sorry

end ProofGarden
