import ProofGarden.Defs

/-!
# Euclid's lemma

If a prime divides a product, it divides one of the factors. This is the fact
that makes prime factorisations unique.
-/

namespace ProofGarden

/-- If `p` is prime and `p ∣ a * b`, then `p ∣ a` or `p ∣ b`. -/
theorem euclids_lemma {p a b : Nat} (hp : IsPrime p) (h : p ∣ a * b) :
    p ∣ a ∨ p ∣ b := by
  sorry

end ProofGarden
