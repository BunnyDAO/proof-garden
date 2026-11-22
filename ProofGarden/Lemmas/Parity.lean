/-!
# Lemma: if a square is even, the number is even

An odd number times an odd number is odd, so if `p * p` is even then `p` is.
-/

namespace ProofGarden

/-- If 2 divides `p * p`, then 2 divides `p`. -/
theorem two_dvd_of_two_dvd_mul_self {p : Nat} (h : 2 ∣ p * p) : 2 ∣ p := by
  sorry

end ProofGarden
