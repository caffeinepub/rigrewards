# Specification

## Summary
**Goal:** Add an offline bank-transfer deposit request flow with admin approval that credits a user wallet, and use wallet credits to pay for rig/package purchases.

**Planned changes:**
- Backend: Store deposit requests (amount, optional reference/notes, timestamp) with status lifecycle (pending/approved/rejected) retrievable by users (own) and admins (all).
- Backend: Add admin-only actions to approve/reject deposits; on approval, admin enters credited amount and the user wallet balance increases accordingly.
- Backend: Add wallet and Transaction records for admin credits and rig/package purchases (including amount, user, admin principal where applicable, timestamp, and link to deposit request for credits).
- Backend: Enforce admin authorization for deposit approval/crediting with admin principals stored in canister state.
- Backend: Update rig/package purchase flow to check wallet balance, deduct on success, reject on insufficient balance with a clear English error, and record a purchase transaction.
- Frontend: User pages/components for wallet balance, creating deposit requests, viewing deposit request statuses, and viewing transaction history.
- Frontend: Admin pages/components for a deposits queue (filter by status) and an approval/rejection workflow including credited amount input and optional note.
- Frontend: Apply a consistent RigRewards visual theme across user and admin areas (mobile-first, responsive; avoid a default blue/purple-heavy palette).

**User-visible outcome:** Users can request a bank-transfer deposit, track its status, see wallet balance and transaction history, and spend credited balance on rig/package purchases; admins can review deposit requests and approve/reject them while crediting user wallets with an auditable trail.
