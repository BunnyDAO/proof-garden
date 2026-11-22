/-!
# Shared definitions

Core Lean 4 has no `Nat.Prime`, `Finset.sum` or `Nat.factorial` (those live in
Mathlib, which this garden does not use), so the few notions the theorems need
are defined here. These are definitions, not proofs: nothing here is `sorry`.
-/

namespace ProofGarden

/-- `IsPrime p`: `p` is at least 2 and its only divisors are 1 and `p` itself. -/
def IsPrime (p : Nat) : Prop :=
  2 ≤ p ∧ ∀ d, d ∣ p → d = 1 ∨ d = p

/-- `sumRange n f = f 0 + f 1 + ... + f (n - 1)` (the empty sum is 0). -/
def sumRange : Nat → (Nat → Nat) → Nat
  | 0, _ => 0
  | n + 1, f => sumRange n f + f n

/-- The factorial `n! = 1 * 2 * ... * n`, with `0! = 1`. -/
def fact : Nat → Nat
  | 0 => 1
  | n + 1 => (n + 1) * fact n

/-- The Fibonacci numbers `0, 1, 1, 2, 3, 5, 8, ...`. -/
def fib : Nat → Nat
  | 0 => 0
  | 1 => 1
  | n + 2 => fib n + fib (n + 1)

end ProofGarden
