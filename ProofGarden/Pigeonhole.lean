/-!
# The pigeonhole principle

Put more pigeons than holes and two pigeons must share a hole.
-/

namespace ProofGarden

/-- If `m < n`, any map from `n` things to `m` things sends two different
things to the same place. -/
theorem pigeonhole {n m : Nat} (h : m < n) (f : Fin n → Fin m) :
    ∃ i j, i ≠ j ∧ f i = f j := by
  sorry

end ProofGarden
