import ProofGarden.Defs
import ProofGarden.Lemmas.GaussDouble

/-!
# Gauss's sum

The numbers from 1 to `n` add up to `n(n+1)/2`, the trick young Gauss is said
to have used to add 1 to 100 in seconds.
-/

namespace ProofGarden

/-- `1 + 2 + ... + n = n * (n + 1) / 2`. -/
theorem gauss_sum (n : Nat) : sumRange (n + 1) (fun i => i) = n * (n + 1) / 2 := by
  sorry

end ProofGarden
