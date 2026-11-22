/-!
# Cantor's theorem

There is no way to list all subsets of a set using the set's own elements:
for any map `f` from a type `α` to its subsets, some subset is missed.
(The subset `{a | a ∉ f a}` cannot be `f a` for any `a`.)
-/

namespace ProofGarden

/-- No function from a type to its powerset (`α → Prop`) is surjective:
there is always a subset `s` that `f` never hits. -/
theorem cantor {α : Type} (f : α → (α → Prop)) :
    ¬ ∀ s : α → Prop, ∃ a, f a = s := by
  sorry

end ProofGarden
