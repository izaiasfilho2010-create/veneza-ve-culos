# Security Specification & Test Protocol: Veneza Veículos

## 1. Data Invariants
1. Public visitors can only read vehicles whose status is 'available' or 'sold'.
2. Public visitors CANNOT read vehicles with status 'hidden'.
3. Unauthenticated visitors CANNOT create, update, or delete any vehicle.
4. Public visitors can read official site settings and approved reviews.
5. Unauthenticated visitors CANNOT write or alter site settings or inject unapproved reviews.
6. The administrative 6-digit PIN and its hash are NEVER exposed in client-accessible Firestore collections or documents.
7. Only authenticated administrators (via backend server token or admin claim) can create, modify, or delete vehicles, update site settings, and manage reviews.
8. Every vehicle must strictly conform to allowed fields, size limits, and valid data types (price > 0, mileage >= 0, etc.).

## 2. The Dirty Dozen Payloads (Target: PERMISSION_DENIED)
1. **Unauthenticated Vehicle Injection**: Public unauthenticated client sends `setDoc(doc(db, 'vehicles', 'hack1'), { make: 'Fake', status: 'available' })`.
2. **Public Status Tampering**: Visitor attempts `updateDoc` on a vehicle to change price or status to 'hidden'.
3. **Ghost Field Poisoning**: Malicious update adding a system bypass key like `{ isAdmin: true }` or `{ backdoor: true }`.
4. **Oversized String Bomb**: Injection of a 5MB base64 string into the `make` field.
5. **Unauthorized Delete**: Anonymous client calling `deleteDoc(doc(db, 'vehicles', 'realId'))`.
6. **Site Settings Hijack**: Malicious user trying to update `siteSettings/current` with a fake phone number or bank info.
7. **Fake Review Injection**: Malicious visitor attempting to add an unverified 5-star review directly to `reviews` collection.
8. **Hidden Inventory Scraping**: Unauthenticated query trying to retrieve `status == 'hidden'` vehicles.
9. **Zero-Byte Vehicle Create**: Attempt to create a vehicle document with missing mandatory fields.
10. **Admin Secrets Discovery**: Attempt to read any hypothetical admin credentials collection directly from client.
11. **Negative Price Exploit**: Creating a vehicle with negative price `{ price: -50000 }`.
12. **Malicious Review Tamper**: Editing another customer's review comment or rating.
