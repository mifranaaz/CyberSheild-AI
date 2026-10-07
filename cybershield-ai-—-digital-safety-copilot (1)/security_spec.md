# CyberShield AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny Catch-All**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **PII Split Isolation**: User emails are stored strictly in `/users/{userId}/private/{docId}` (`docId == 'info'`) and never exposed in `/users/{userId}`. Only the authenticated owner (`request.auth.uid == userId`) can read or write their profile and private PII subcollection.
3. **Relational Ownership of Scans**: A `ScanRecord` in `/scans/{scanId}` can only be created if `incoming().userId == request.auth.uid` and the parent user document `/users/$(request.auth.uid)` exists (`exists(...)`).
4. **Secure List Queries**: `allow list` on `/scans/{scanId}` strictly enforces `resource.data.userId == request.auth.uid` without `get()`/`exists()` inside `list`.
5. **Temporal Integrity & Immutability**: `createdAt` must equal `request.time` on creation and remain immutable on updates; `updatedAt` must equal `request.time` on updates.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on UserProfile**: `{ uid: "user1", displayName: "Alice", securityScore: 90, scansCount: 1, isAdmin: true, createdAt: request.time, updatedAt: request.time }` -> Rejected by `hasOnly()`.
2. **Identity Spoofing on Scan Create**: Authenticated as `user1`, creating `/scans/scan1` with `{ userId: "user2", ... }` -> Rejected by `data.userId == request.auth.uid`.
3. **Orphaned Scan Write**: Authenticated as `user_no_profile`, creating `/scans/scan1` when `/users/user_no_profile` does not exist -> Rejected by `exists(/databases/$(database)/documents/users/$(request.auth.uid))`.
4. **Cross-User PII Read**: Authenticated as `user2`, attempting `get` on `/users/user1/private/info` -> Rejected by `isOwner(userId)`.
5. **Unbounded String Resource Poisoning**: Creating `/scans/scan1` with `summaryExplanation` of 15,000 chars -> Rejected by `data.summaryExplanation.size() <= 2000`.
6. **ID Poisoning Attack**: Creating a document with invalid characters or 500-char ID -> Rejected by `isValidId()`.
7. **Client Timestamp Forgery**: Creating `/scans/scan1` with `createdAt: timestamp.date(2020, 1, 1)` -> Rejected by `incoming().createdAt == request.time`.
8. **Immutable Field Mutation**: Updating `/users/user1` by changing `uid` or `createdAt` -> Rejected by `incoming().uid == existing().uid && incoming().createdAt == existing().createdAt`.
9. **Unauthorized List Scraping**: Authenticated as `user1`, running an unfiltered `list` query across `/scans` -> Rejected by `resource.data.userId == request.auth.uid`.
10. **Value Poisoning on Update**: Updating `/users/user1` `securityScore` with a string `"100"` or number `999` -> Rejected by `isValidUserProfile(incoming())`.
11. **Invalid Enum Injection**: Creating `/scans/scan1` with `classification: "SUPER_SAFE"` -> Rejected by `data.classification in ['SAFE', 'SUSPICIOUS', 'HIGH RISK', 'DANGEROUS']`.
12. **Unauthenticated Write**: Anonymous/signed-out client attempting to create `/users/user1` -> Rejected by `isSignedIn()`.
