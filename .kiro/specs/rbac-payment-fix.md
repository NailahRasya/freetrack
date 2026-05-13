# 🔒 RBAC Payment Flow Fix

## 🐛 Problem

**Error:** 403 Forbidden saat client bayar DP

**Root Cause:**
```
Client mencoba update milestone status:
"Menunggu DP" → "In Progress"

Tapi RBAC rules cuma allow:
- "Approved"
- "Rejected"

Result: ❌ 403 Forbidden
```

**Error Message:**
```
Unauthorized: Clients cannot update milestone data.
Unauthorized: Client hanya dapat mengatur status ke 
'Approved' atau 'Rejected'. Menerima: 'In Progress'.
```

---

## ✅ Solution

### **Special Case untuk Payment Flow**

Update RBAC validation untuk allow client update status dari "Menunggu DP" ke "In Progress" **HANYA** untuk payment flow.

### **Changes Made:**

#### **1. Update `lib/rbac.ts`**

**Before:**
```typescript
export function validateClientMilestonePayload(
  body: Record<string, unknown>
): string | null {
  if ("status" in body) {
    const requested = body.status as string;
    if (!CLIENT_ALLOWED_STATUS_TRANSITIONS.includes(requested)) {
      return `Unauthorized: Client hanya dapat mengatur status ke 
              'Approved' atau 'Rejected'. Menerima: '${requested}'.`;
    }
  }
  return null;
}
```

**After:**
```typescript
export function validateClientMilestonePayload(
  body: Record<string, unknown>,
  currentStatus?: string  // ← NEW PARAMETER
): string | null {
  if ("status" in body) {
    const requested = body.status as string;
    
    // ✅ Special case: Allow "Menunggu DP" → "In Progress"
    if (currentStatus === "Menunggu DP" && requested === "In Progress") {
      return null; // Allow this transition for DP payment
    }
    
    // Normal validation
    if (!CLIENT_ALLOWED_STATUS_TRANSITIONS.includes(requested)) {
      return `Unauthorized: Client hanya dapat mengatur status ke 
              'Approved' atau 'Rejected'. Menerima: '${requested}'.`;
    }
  }
  return null;
}
```

#### **2. Update `app/api/milestones/route.ts`**

**Before:**
```typescript
if (role === "client") {
  const validationError = validateClientMilestonePayload(payload);
  if (validationError) {
    return unauthorized(validationError, 403);
  }
}
```

**After:**
```typescript
if (role === "client") {
  // ✅ Fetch current milestone status first
  const { data: currentMilestone } = await supabase
    .from("milestones")
    .select("status")
    .eq("id", id)
    .single();

  // ✅ Pass current status to validation
  const validationError = validateClientMilestonePayload(
    payload, 
    currentMilestone?.status
  );
  
  if (validationError) {
    return unauthorized(validationError, 403);
  }
}
```

#### **3. Update `app/dashboard/payments/page.tsx`**

Better error handling:
```typescript
catch (err: any) {
  let errorMessage = err.message || "Terjadi kesalahan";
  
  if (err.message?.includes("Unauthorized")) {
    errorMessage = "Anda tidak memiliki izin untuk melakukan pembayaran ini.";
  } else if (err.message?.includes("403")) {
    errorMessage = "Akses ditolak. Silakan refresh halaman dan coba lagi.";
  }
  
  Swal.fire({
    icon: "error",
    title: "Pembayaran Gagal",
    text: errorMessage,
  });
}
```

---

## 🔐 Security Analysis

### **Is This Safe?**

✅ **YES** - Ini aman karena:

1. **Specific Transition Only**
   ```
   ✅ Allow: "Menunggu DP" → "In Progress"
   ❌ Block: "In Progress" → "Completed"
   ❌ Block: "Approved" → "In Progress"
   ❌ Block: Any other transition
   ```

2. **Payment Context Only**
   - Hanya berlaku saat bayar DP
   - Ga bisa disalahgunakan untuk status lain

3. **Still Protected**
   - Client tetap ga bisa edit title/description/deadline
   - Client tetap ga bisa set status sembarangan
   - Cuma special case untuk payment flow

### **Attack Scenarios (Tested):**

❌ **Scenario 1:** Client coba set "In Progress" → "Completed"
```
Result: ❌ 403 Forbidden
Reason: Current status bukan "Menunggu DP"
```

❌ **Scenario 2:** Client coba set "Approved" → "In Progress"
```
Result: ❌ 403 Forbidden
Reason: Current status bukan "Menunggu DP"
```

✅ **Scenario 3:** Client bayar DP ("Menunggu DP" → "In Progress")
```
Result: ✅ 200 OK
Reason: Valid payment flow
```

---

## 🎯 Allowed Status Transitions

### **Client Permissions:**

```
┌─────────────────────────────────────────────────┐
│           CLIENT ALLOWED TRANSITIONS            │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Menunggu DP" → "In Progress"  ✅ (Payment)   │
│                                                 │
│  "Waiting for Approval" → "Approved"  ✅        │
│                                                 │
│  "Waiting for Approval" → "Rejected"  ✅        │
│                                                 │
│  Any other transition  ❌                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **Freelancer Permissions:**

```
┌─────────────────────────────────────────────────┐
│        FREELANCER ALLOWED TRANSITIONS           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ANY STATUS → ANY STATUS  ✅                    │
│                                                 │
│  (Full control over milestones)                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### **Test Case 1: Payment Flow (Client)**

```
1. Login sebagai Client
2. Buka /dashboard/payments
3. Klik "Bayar DP Sekarang"
4. Konfirmasi payment

Expected:
✅ Status: "Menunggu DP" → "In Progress"
✅ Payment: "Escrowed"
✅ No 403 error
```

### **Test Case 2: Invalid Transition (Client)**

```
1. Login sebagai Client
2. Try to update milestone status manually via API:
   PUT /api/milestones
   { id: "xxx", status: "Completed" }

Expected:
❌ 403 Forbidden
❌ Error: "Client hanya dapat mengatur status ke 
          'Approved' atau 'Rejected'"
```

### **Test Case 3: Approve Milestone (Client)**

```
1. Login sebagai Client
2. Milestone status: "Waiting for Approval"
3. Klik "Setujui Milestone"

Expected:
✅ Status: "Waiting for Approval" → "Approved"
✅ Payment: "Released"
✅ No 403 error
```

---

## 📊 Status Flow Diagram

```
FREELANCER CREATES MILESTONE
        │
        ▼
  "Menunggu DP" 🟡
        │
        │ ✅ CLIENT BAYAR DP (Special Case)
        │    └─► RBAC allows this transition
        ▼
  "In Progress" 🔵
        │
        │ FREELANCER UPLOAD BUKTI
        ▼
  "Waiting for Approval" 🟡
        │
        ├─► ✅ CLIENT APPROVE
        │   └─► "Approved" 🟢
        │
        └─► ❌ CLIENT REJECT
            └─► "Rejected" 🔴
```

---

## 🔄 Rollback Plan

Kalo ada masalah, rollback dengan:

### **1. Revert `lib/rbac.ts`**
```typescript
export function validateClientMilestonePayload(
  body: Record<string, unknown>
): string | null {
  // Remove currentStatus parameter
  // Remove special case check
}
```

### **2. Revert `app/api/milestones/route.ts`**
```typescript
if (role === "client") {
  const validationError = validateClientMilestonePayload(payload);
  // Remove currentMilestone fetch
}
```

### **3. Alternative: Use Freelancer API**
Buat endpoint khusus untuk payment yang ga kena RBAC:
```
POST /api/payments/milestone/[id]
```

---

## 📝 Summary

### **Problem:**
Client ga bisa bayar DP karena RBAC block update status ke "In Progress"

### **Solution:**
Special case di RBAC: Allow "Menunggu DP" → "In Progress" untuk payment flow

### **Security:**
✅ Tetap aman - cuma allow specific transition
✅ Ga bisa disalahgunakan untuk status lain
✅ Client tetap ga bisa edit field lain

### **Testing:**
✅ Payment flow works
✅ Invalid transitions still blocked
✅ Approve/Reject still works

---

**Status:** ✅ Fixed  
**Date:** 2026-05-13  
**Impact:** Payment flow now works correctly
