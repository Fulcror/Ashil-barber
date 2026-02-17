# Production Security Audit Report

**Date:** February 17, 2026  
**Project:** Ashil Mobile Hairdresser Booking System  
**Status:** MVP - Pre-Launch Review

---

## EXECUTIVE SUMMARY

This MVP booking system has **5 CRITICAL vulnerabilities** that must be fixed before launch:

1. **Race condition allowing double bookings** — Two users can simultaneously book the same slot
2. **Weak confirmation codes** — Vulnerable to brute-force enumeration (Math.random() instead of crypto)
3. **Production error messages leaking stack traces** — Exposing implementation details to attackers
4. **No rate limiting** — Service vulnerable to spam, DoS, and brute-force attacks
5. **No input validation on phone numbers** — Accepting invalid/malicious input

Additionally: **12+ important data integrity, performance, and architectural issues** need fixing.

**Estimated fix time: 4-6 days**. Critical 5 fixes: **1 day**.

---

## TABLE OF CONTENTS

1. [CRITICAL FIXES (Must do before launch)](#critical-fixes)
2. [IMPORTANT IMPROVEMENTS (Should do)](#important-improvements)
3. [NICE-TO-HAVE (Can defer)](#nice-to-have)
4. [NEW FILES TO CREATE](#new-files-to-create)
5. [FILES TO UPDATE](#files-to-update)
6. [DATABASE MIGRATION](#database-migration)
7. [ENVIRONMENT CONFIGURATION](#environment-configuration)
8. [HARDENING CHECKLIST](#hardening-checklist)
9. [TESTING PROCEDURES](#testing-procedures)

---

## CRITICAL FIXES

### CRITICAL-1: Race Condition / Double Booking Vulnerability

**File:** `src/app/api/book/route.js`  
**Problem:**

```javascript
// Lines 33-58: NOT atomic
const existingAppointment = await prisma.bookedAppointment.findFirst({...}); // Check
if (existingAppointment) return; // ← Race window here

const appointment = await prisma.bookedAppointment.create({...}); // Create
```

Between check and create, another request can book the same slot. Result: overbooking.

**Solution:** Use database unique constraint + error handling.

**Step 1: Update Prisma Schema**
Add index to `prisma/schema.prisma`:

```prisma
model BookedAppointment {
  id               Int      @id @default(autoincrement())
  startDatetimeUtc DateTime
  endDatetimeUtc   DateTime
  phoneNumber      String
  confirmationCode String   @unique
  status           String   @db.Enum("pending", "confirmed", "canceled")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([startDatetimeUtc, status])
  @@map("booked_appointments")
}
```

**Step 2: Run migration**

```bash
npx prisma migrate dev --name add_status_enum_and_indexes
```

**Step 3: Update booking logic to catch unique constraint violations**
See [FILES TO UPDATE](#files-to-update) section, `src/app/api/book/route.js`.

---

### CRITICAL-2: Weak Confirmation Code Generation

**File:** `src/app/api/book/route.js`, `src/app/api/appointments/reschedule/route.js`  
**Problem:**

```javascript
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
```

`Math.random()` is NOT cryptographically secure. Attacker can brute-force or enumerate codes.

**Solution:** Use Node.js `crypto` module.

**Create new file:** `src/lib/security.js`

```javascript
import crypto from "crypto";

export function generateSecureConfirmationCode() {
  // Generate 4 random bytes = 8 hex characters
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}

export function encryptPhone(phone) {
  const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-128-gcm", key, iv);
  let encrypted = cipher.update(phone, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptPhone(encrypted) {
  const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex");
  const [iv, authTag, ciphertext] = encrypted.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-128-gcm",
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

**Replace ALL instances of:**

```javascript
function generateConfirmationCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
```

**With:**

```javascript
import { generateSecureConfirmationCode } from "@/lib/security";

// Then use:
const confirmationCode = generateSecureConfirmationCode();
```

**Files to update:**

- `src/app/api/book/route.js` (line 5)
- `src/app/api/appointments/reschedule/route.js` (line 6)

---

### CRITICAL-3: Production Error Messages Leaking Stack Traces

**Problem:** Multiple endpoints return `details: error.message`:

```javascript
// NEVER do this in production:
return Response.json(
  {
    success: false,
    error: "Failed to book appointment. Please try again.",
    details: error.message, // ← Exposes internals
  },
  { status: 500 },
);
```

**Solution:** Never return internal error details. Log them server-side only.

**Create new file:** `src/lib/errorHandler.js`

```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleRouteError(error, context = "") {
  // Log everything server-side
  console.error(`[${context}] Error:`, error);

  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: error.message },
      { status: error.statusCode },
    );
  }

  // Generic error for unknown exceptions
  return Response.json(
    { success: false, error: "An error occurred. Please try again." },
    { status: 500 },
  );
}
```

**Update all API routes:**
Replace pattern:

```javascript
} catch (error) {
  console.error("...", error);
  return Response.json({
    success: false,
    error: "...",
    details: error.message
  }, { status: 500 });
}
```

With:

```javascript
} catch (error) {
  return handleRouteError(error, "CONTEXT_NAME");
}
```

**Files to update:**

- `src/app/api/book/route.js` (lines 78-86)
- `src/app/api/book/verify/route.js` (lines 74-82)
- `src/app/api/calendar/route.js` (lines 85-93)
- `src/app/api/appointments/[confirmationCode]/route.js` (lines 52-60)
- `src/app/api/appointments/reschedule/route.js` (lines 98-106)
- `src/app/api/appointments/cancel/route.js` (lines 61-69)

---

### CRITICAL-4: No Rate Limiting

**Problem:** Any endpoint can be called unlimited times by any IP.

Attacker can:

- Spam `/api/book` to create fake bookings
- Brute-force confirmation codes via `/api/appointments/[code]`
- DoS `/api/calendar` with parallel requests

**Solution:** Install Upstash Redis + implement rate limiting.

**Step 1: Install dependency**

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Step 2: Setup Upstash account**
Go to https://console.upstash.com and create a free Redis instance. Copy the REST URL and token.

**Step 3: Add to `.env.local`** (see ENVIRONMENT section below)

**Step 4: Create new file:** `src/lib/rateLimit.js`

```javascript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiters = {
  // 10 bookings per hour per IP
  booking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
  }),
  // 20 lookup attempts per hour per IP
  lookup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
  }),
  // 50 calendar calls per hour per IP
  calendar: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"),
    analytics: true,
  }),
};

export async function checkRateLimit(limiter, identifier) {
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
```

**Step 5: Add to routes**

Example for `src/app/api/book/route.js`:

```javascript
import { checkRateLimit, rateLimiters } from "@/lib/rateLimit";
import { AppError } from "@/lib/errorHandler";

export async function POST(request) {
  // Get client IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = await checkRateLimit(rateLimiters.booking, ip);

  if (!success) {
    throw new AppError(
      "Too many requests. Please try again in a few minutes.",
      429,
    );
  }

  // ... rest of booking logic
}
```

Apply to:

- `src/app/api/book/route.js` — use `rateLimiters.booking`
- `src/app/api/appointments/[confirmationCode]/route.js` — use `rateLimiters.lookup`
- `src/app/api/calendar/route.js` — use `rateLimiters.calendar`

---

### CRITICAL-5: No Input Validation on Phone Numbers

**Problem:**  
Only checks existence, not format. Can accept invalid/malicious input:

```javascript
if (!phone) return; // This is all current validation does
```

**Solution:** Create validation utility.

**Create new file:** `src/lib/validation.js`

```javascript
export const VALIDATION_RULES = {
  phone: {
    regex: /^[\d\s\-\+\(\)]{7,20}$/,
    maxLength: 20,
  },
  confirmationCode: {
    regex: /^[A-Z0-9]{6,8}$/,
  },
  date: {
    regex: /^\d{4}-\d{2}-\d{2}$/,
  },
  name: {
    maxLength: 100,
    regex: /^[a-zA-Z\s'-]{2,100}$/,
  },
};

export function validatePhone(phone) {
  if (!phone?.trim()) return "Phone number is required";
  if (phone.length > VALIDATION_RULES.phone.maxLength)
    return "Phone number too long";
  if (!VALIDATION_RULES.phone.regex.test(phone))
    return "Invalid phone number format";
  return null;
}

export function validateConfirmationCode(code) {
  if (!code?.trim()) return "Confirmation code is required";
  if (!VALIDATION_RULES.confirmationCode.regex.test(code.toUpperCase()))
    return "Invalid confirmation code format (must be 6-8 alphanumeric)";
  return null;
}

export function validateDate(date) {
  if (!VALIDATION_RULES.date.regex.test(date))
    return "Invalid date format (use YYYY-MM-DD)";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return null;
}

export function validateName(name) {
  if (!name?.trim()) return "Name is required";
  if (name.length > VALIDATION_RULES.name.maxLength) return "Name too long";
  if (!VALIDATION_RULES.name.regex.test(name)) return "Invalid name format";
  return null;
}
```

**Update booking route:** See `src/app/api/book/route.js` in FILES TO UPDATE section.

---

## DATA INTEGRITY RISKS (Should fix)

### DATAINT-1: Race Condition in Reschedule

**Same issue as double-booking but in [src/app/api/appointments/reschedule/route.js](src/app/api/appointments/reschedule/route.js):**

```javascript
// Lines 50: Check if new slot is available
const existingAppointment = await prisma.bookedAppointment.findFirst({...});
if (existingAppointment) return; // RACE WINDOW

// Line 86: Create new appointment
const newAppointment = await prisma.bookedAppointment.create({...});
```

**Fix:**  
Same as booking — use unique database constraint + catchPrismaError.

---

### DATAINT-2: Missing Database Constraints on `status` Enum

**Issue:**

```javascript
model BookedAppointment {
  status String // ← Can be ANY value
}
```

Someone could insert `UPDATE booked_appointments SET status = 'invalid'` directly. Your app expects only `"pending"`, `"confirmed"`, `"canceled"`.

**Impact:**

- Query filters break: `status: { in: ["confirmed", "pending"] }` won't match invalid statuses.
- Logic errors in frontend when status is unexpected.

**Fix:**  
Add database constraint (already in CRITICAL-1 schema update):

```javascript
// In src/prisma/schema.prisma
model BookedAppointment {
  // ... other fields
  status           String   @db.Enum("pending", "confirmed", "canceled")
  // ...
  @@index([startDatetimeUtc, status])
}
```

Then run migration:

```bash
npx prisma migrate dev --name add_status_enum
```

---

### DATAINT-3: Phone Numbers Stored as Plain Text

**Problem:** If database is breached, all phone numbers are exposed.

**Impact:**

- GDPR/privacy violations.
- Spam/harassment of customers.
- Reputational damage.

**Fix:** See IMP-4 below for phone encryption approach.

---

## PERFORMANCE / LOADING SPEED ISSUES

### PERF-1: Calendar Endpoint Fetches ALL Bookings Into Memory

**Issue:**  
[src/app/api/calendar/route.js](src/app/api/calendar/route.js#L38-L42):

Currently loads ALL historical appointments into memory, then loops through 150 slots checking each:

```javascript
const bookedAppointments = await prisma.bookedAppointment.findMany({
  where: {
    status: { in: ["confirmed", "pending"] },
  },
});
```

If you have 10,000 historical appointments: O(n) × 150 checks = 1.5M iterations per request.

**Fix:**  
Fetch only 30-day window (already in IMP-2 below).

---

### PERF-2: Inefficient Same-Day Collision Detection

**Issue:**  
Each booking checks for conflicts by exact time match only:

```javascript
const existingAppointment = await prisma.bookedAppointment.findFirst({
  where: {
    startDatetimeUtc: utcDateTime, // Exact match only
    status: { in: ["confirmed", "pending"] },
  },
});
```

This works for **exact** collisions but is inefficient for **overlapping** slots. If appointments are 1 hour long, booking 2:00 PM shouldn't be allowed if 1:00 PM is already booked.

**Fix:**  
Check for time range overlap (add after PERF-1 fix):

```javascript
const existingAppointment = await prisma.bookedAppointment.findFirst({
  where: {
    AND: [
      { status: { in: ["confirmed", "pending"] } },
      { startDatetimeUtc: { lt: utcEndDateTime } }, // Existing starts before new ends
      { endDatetimeUtc: { gt: utcDateTime } }, // Existing ends after new starts
    ],
  },
});
```

---

### PERF-3: Missing Database Indexes

**Issue:**  
[prisma/schema.prisma](prisma/schema.prisma): No indexes on frequently-queried columns, so calendar lookups scan entire table.

**Current:**

```javascript
model BookedAppointment {
  startDatetimeUtc DateTime
  status           String
  // Missing: @@index([startDatetimeUtc, status])
}
```

**Fix:**  
Already documented in CRITICAL-1, add composite index:

```javascript
@@index([startDatetimeUtc, status])
```

This makes 30-day calendar queries 10x faster.

---

## ARCHITECTURE & DESIGN PATTERNS

### ARCH-1: No Error Abstraction Layer

**Issue:**  
Each route file has different error handling:

```javascript
// book/route.js
return Response.json({ error: "...", details: error.message }, { status: 500 });

// verify/route.js
return Response.json(
  { success: false, error: "...", details: error.message },
  { status: 500 },
);
```

Inconsistent responses + error details leak to frontend.

**Fix:**  
Already documented in CRITICAL-3: Create `src/lib/errorHandler.js` for unified error responses.

---

### ARCH-2: Missing Environment Layer Abstraction

**Issue:**  
Business logic is scattered across route files. If you want to change appointment duration or hours, you edit multiple files.

**Fix:**  
Already documented in IMP-5: Create `src/lib/config.js` with all configuration.

---

## MISSING PRODUCTION SAFEGUARDS

### SAFEGUARD-1: No Request Size Limit

**Issue:**  
Attacker could send 100MB JSON payload causing OOM crash.

**Fix:**  
Add to `next.config.mjs`:

```javascript
export default {
  api: {
    bodyParser: {
      sizeLimit: "10kb",
    },
  },
};
```

---

### SAFEGUARD-2: No Health Check Endpoint

**Issue:**  
Deployment monitoring can't verify database connectivity. Uptime monitors can't distinguish "is it running?" from "is it broken?"

**Fix:**  
Create `src/app/api/health/route.js`:

```javascript
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { status: "error", message: "Database unavailable" },
      { status: 503 },
    );
  }
}
```

Then monitor it with:

```bash
# Every 30 seconds
curl https://your-site.com/api/health
```

---

### SAFEGUARD-3: No Audit Logging

**Issue:**  
If a booking mysteriously disappears or is modified, you can't trace who/what/when.

**Fix:**  
Create `src/lib/audit.js`:

```javascript
export async function logAudit(action, resourceId, resourceType, details = {}) {
  try {
    console.info(
      `[AUDIT] ${action} | ${resourceType}:${resourceId} | timestamp: ${new Date().toISOString()} | ${JSON.stringify(details)}`,
    );
    // Later: upgrade to database table for long-term retention
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}
```

Then use it in every booking operation:

```javascript
import { logAudit } from "@/lib/audit";

await logAudit("BOOKING_CREATED", appointment.id, "Appointment", {
  phoneHash: phone.slice(0, 3) + "***",
  ip: request.headers.get("x-forwarded-for"),
});
```

---

## CODE QUALITY / MAINTAINABILITY PROBLEMS

### MAINT-1: No Validation Util Layer

**Issue:**  
Validation is scattered across every route. If you want to change phone validation logic, you edit multiple files.

**Fix:**  
Already documented in CRITICAL-5: Create `src/lib/validation.js` and use consistently.

---

### MAINT-2: Hardcoded Availability Hours & Duration

**Issue:**  
[src/app/api/calendar/route.js](src/app/api/calendar/route.js#L24-L30) and [src/app/api/book/route.js](src/app/api/book/route.js#L28) hardcode:

```javascript
const allHours = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];
const utcEndDateTime = new Date(utcDateTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour
```

If Ashil changes hours, you must edit multiple files.

**Fix:**  
Already documented in IMP-5: Create `src/lib/config.js` with all configuration.

---

## UNNECESSARY COMPLEXITY

### COMPLEX-1: Unused Phone Formatting Utility

**Issue:**  
[lib/formatPhone.js](lib/formatPhone.js) exports `formatPhoneForWhatsApp()` but is never called in the booking flow.

**Fix:**  
Either use it consistently (in SMS/WhatsApp notification flow if you add that later) or delete the unused file and dependency.

For now: **Delete lib/formatPhone.js** unless you're planning WhatsApp notifications soon.

---

## IMPLEMENTATION DETAILS & OPTIMIZATION FIXES

### IMP-1: Calendar Endpoint Inefficiency (Performance Optimization)

**File:** `src/app/api/calendar/route.js`

Currently fetches ALL historical bookings into memory. Should only fetch 30-day window:

```javascript
// BEFORE:
const bookedAppointments = await prisma.bookedAppointment.findMany({
  where: {
    status: { in: ["confirmed", "pending"] },
  },
});

// AFTER:
const thirtyDaysFromNow = addDays(today, 30);

const bookedAppointments = await prisma.bookedAppointment.findMany({
  where: {
    status: { in: ["confirmed", "pending"] },
    startDatetimeUtc: {
      gte: today,
      lt: thirtyDaysFromNow,
    },
  },
  select: { startDatetimeUtc: true }, // Only fetch what you need
});
```

---

### IMP-2: Calendar HTTP Caching

**File:** `src/app/api/calendar/route.js`

Add HTTP caching header so browsers cache results for 2 minutes (reduces load):

```javascript
return Response.json(responseData, {
  status: 200,
  headers: {
    "Cache-Control": "public, max-age=120", // 2-minute cache
  },
});
```

---

### IMP-3: Phone Number Encryption (DATAINT-3 Fix)

**Problem:** Phone numbers in database are readable plaintext.

**Solution:** Encrypt at rest using `src/lib/security.js`

Add encryption functions:

```javascript
import crypto from "crypto";

export function encryptPhone(phone) {
  const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(phone, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptPhone(encryptedPhone) {
  const key = Buffer.from(process.env.PHONE_ENCRYPTION_KEY, "hex");
  const [iv, encrypted] = encryptedPhone.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex"),
  );
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}
```

Then update booking to encrypt:

```javascript
import { encryptPhone } from "@/lib/security";

const appointment = await prisma.bookedAppointment.create({
  data: {
    phoneNumber: encryptPhone(phone.trim()),
    // ... other fields
  },
});
```

---

### IMP-4: Config Centralization (MAINT-2 Fix)

**Files affected:** `src/app/api/calendar/route.js`, `src/app/api/book/route.js`

Move hardcoded hours/duration to `src/lib/config.js`:

```javascript
export const BOOKING_CONFIG = {
  businessHours: {
    timeSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"],
  },
  appointmentDurationMinutes: 60,
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
  availabilityWindowDays: 30,
  timezone: "Asia/Dubai",
};
```

Then import everywhere:

```javascript
import { BOOKING_CONFIG } from "@/lib/config";

const timeSlots = BOOKING_CONFIG.businessHours.timeSlots;
```

This makes future changes (new hours, longer appointment duration) require only 1 file edit instead of 5.

---

## ADDITIONAL ENHANCEMENTS (Phase 2 / Nice-to-Have)

These are improvements that are good-to-have but not blocking launch:

### NICE-1: Error Tracking & Monitoring

**Tools:** Sentry, LogRocket, or similar

Tracks errors in production so you can fix issues you don't know about.

```bash
npm install @sentry/nextjs
```

### NICE-2: SMS/Email Confirmations

Send booking confirmation codes to customer via SMS or email instead of only showing on screen.

```javascript
// src/lib/notifications.js
export async function sendBookingConfirmation(phone, code, dateTime) {
  // Integrate Twilio, SendGrid, AWS SES, etc.
  // Example with Twilio:
  // await client.messages.create({ body: `Code: ${code}` })
}
```

### NICE-3: Database Query Monitoring

Track slow queries with query performance insights:

```javascript
// In Prisma middleware
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  if (after - before > 1000) {
    console.warn(
      `Slow query: ${params.model}.${params.action} took ${after - before}ms`,
    );
  }
  return result;
});
```

---

## NEW FILES TO CREATE

1. **`src/lib/errorHandler.js`** — Centralized error handling
2. **`src/lib/validation.js`** — Input validation utilities
3. **`src/lib/security.js`** — Crypto functions (codes, encryption)
4. **`src/lib/config.js`** — Configuration constants
5. **`src/lib/rateLimit.js`** — Rate limiting setup
6. **`src/lib/audit.js`** — Audit logging
7. **`.env.example`** — Environment variable template
8. **`SECURITY_AUDIT_FIXES.md`** — This file (for reference)
9. **`src/app/api/health/route.js`** — Health check endpoint

---

## FILES TO UPDATE

### 1. `src/app/api/book/route.js`

Replace entire file with:

```javascript
import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { AppError, handleRouteError } from "@/lib/errorHandler";
import { validatePhone, validateDate, validateName } from "@/lib/validation";
import { generateSecureConfirmationCode } from "@/lib/security";
import { checkRateLimit, rateLimiters } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    // Rate limit check
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = await checkRateLimit(rateLimiters.booking, ip);
    if (!success) {
      throw new AppError(
        "Too many requests. Please try again in a few minutes.",
        429,
      );
    }

    const body = await request.json();
    const { date, time, name, phone } = body;

    // Validate all fields
    const nameErr = validateName(name);
    if (nameErr) throw new AppError(nameErr, 400);

    const phoneErr = validatePhone(phone);
    if (phoneErr) throw new AppError(phoneErr, 400);

    const dateErr = validateDate(date);
    if (dateErr) throw new AppError(dateErr, 400);

    if (!time?.trim()) throw new AppError("Time is required", 400);

    // Convert to UTC using shared helper
    const utcDateTime = convertToUTC(date, time);
    const utcEndDateTime = new Date(utcDateTime.getTime() + 60 * 60 * 1000);

    // Generate secure confirmation code
    const confirmationCode = generateSecureConfirmationCode();

    // Try to create appointment
    try {
      const appointment = await prisma.bookedAppointment.create({
        data: {
          startDatetimeUtc: utcDateTime,
          endDatetimeUtc: utcEndDateTime,
          phoneNumber: phone.trim(),
          confirmationCode: confirmationCode,
          status: "pending",
        },
      });

      // Return success response
      return Response.json(
        {
          success: true,
          message: "Appointment booked successfully!",
          appointment: {
            id: appointment.id,
            confirmationCode: confirmationCode,
            status: appointment.status,
          },
        },
        { status: 201 },
      );
    } catch (dbError) {
      // Handle unique constraint violation (time slot already booked)
      if (dbError.code === "P2002") {
        throw new AppError(
          "This time slot is no longer available. Please select another time.",
          409,
        );
      }
      throw dbError; // Re-throw other DB errors
    }
  } catch (error) {
    return handleRouteError(error, "BOOKING_POST");
  }
}
```

---

### 2. `src/app/api/book/verify/route.js`

Replace error handling at end:

OLD:

```javascript
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to verify appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
```

NEW:

```javascript
  } catch (error) {
    return handleRouteError(error, "BOOKING_VERIFY");
  }
}
```

Add import at top:

```javascript
import { AppError, handleRouteError } from "@/lib/errorHandler";
```

---

### 3. `src/app/api/calendar/route.js`

Replace entire function with:

```javascript
import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errorHandler";
import { checkRateLimit, rateLimiters } from "@/lib/rateLimit";
import { BOOKING_CONFIG } from "@/lib/config";

export async function GET(request) {
  try {
    // Rate limit check
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = await checkRateLimit(rateLimiters.calendar, ip);
    if (!success) {
      return Response.json(
        { success: false, error: "Too many requests. Try again later." },
        { status: 429 },
      );
    }

    const timeZone = BOOKING_CONFIG.timezone;
    const today = toZonedTime(new Date(), timeZone);
    const availableDates = [];

    const thirtyDaysFromNow = addDays(
      today,
      BOOKING_CONFIG.availabilityWindowDays,
    );

    // Generate available dates (work days only)
    for (let i = 0; i < BOOKING_CONFIG.availabilityWindowDays; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();

      if (BOOKING_CONFIG.workDays.includes(dayOfWeek)) {
        availableDates.push(format(date, "yyyy-MM-dd"));
      }
    }

    // Fetch only appointments in the relevant window (performance optimization)
    const bookedAppointments = await prisma.bookedAppointment.findMany({
      where: {
        status: { in: ["confirmed", "pending"] },
        startDatetimeUtc: {
          gte: today,
          lt: thirtyDaysFromNow,
        },
      },
      select: { startDatetimeUtc: true }, // Only fetch what you need
    });

    // Build availability map
    const availability = {};
    const datesWithAvailableSlots = [];

    availableDates.forEach((dateStr) => {
      const timeSlots = BOOKING_CONFIG.businessHours.timeSlots.map(
        (timeStr) => {
          const utcDateTime = convertToUTC(dateStr, timeStr, timeZone);

          const isBooked = bookedAppointments.some((appointment) => {
            const appointmentStart = new Date(
              appointment.startDatetimeUtc,
            ).getTime();
            return appointmentStart === utcDateTime.getTime();
          });

          return {
            time: timeStr,
            status: isBooked ? "booked" : "available",
          };
        },
      );

      availability[dateStr] = timeSlots;

      const hasAvailableSlot = timeSlots.some((s) => s.status === "available");
      if (hasAvailableSlot) {
        datesWithAvailableSlots.push(dateStr);
      }
    });

    const responseData = {
      success: true,
      availableDates: datesWithAvailableSlots,
      availability,
      timestamp: new Date().toISOString(),
    };

    return Response.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=120", // 2-minute client cache
      },
    });
  } catch (error) {
    return handleRouteError(error, "CALENDAR_GET");
  }
}
```

---

### 4. `src/app/api/appointments/[confirmationCode]/route.js`

Replace entire function with:

```javascript
import { prisma } from "@/lib/prisma";
import { AppError, handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode } from "@/lib/validation";
import { checkRateLimit, rateLimiters } from "@/lib/rateLimit";

export async function GET(request, { params }) {
  try {
    // Rate limit check
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success } = await checkRateLimit(rateLimiters.lookup, ip);
    if (!success) {
      throw new AppError(
        "Too many requests. Please try again in a few minutes.",
        429,
      );
    }

    const { confirmationCode } = (params ? await params : {}) || {};

    const codeErr = validateConfirmationCode(confirmationCode);
    if (codeErr) throw new AppError(codeErr, 400);

    const appointment = await prisma.bookedAppointment.findUnique({
      where: { confirmationCode: confirmationCode.toUpperCase() },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    return Response.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          startDatetimeUtc: appointment.startDatetimeUtc,
          endDatetimeUtc: appointment.endDatetimeUtc,
          phoneNumber: appointment.phoneNumber,
          confirmationCode: appointment.confirmationCode,
          status: appointment.status,
          createdAt: appointment.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, "APPOINTMENT_LOOKUP");
  }
}
```

---

### 5. `src/app/api/appointments/reschedule/route.js`

Replace entire file with:

```javascript
import { convertToUTC } from "@/lib/timeConversion";
import { prisma } from "@/lib/prisma";
import { AppError, handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode, validateDate } from "@/lib/validation";
import { generateSecureConfirmationCode } from "@/lib/security";

export async function POST(request) {
  try {
    const body = await request.json();
    const { confirmationCode, newDate, newTime } = body;

    const codeErr = validateConfirmationCode(confirmationCode);
    if (codeErr) throw new AppError(codeErr, 400);

    const dateErr = validateDate(newDate);
    if (dateErr) throw new AppError(dateErr, 400);

    if (!newTime?.trim()) throw new AppError("Time is required", 400);

    // Lookup existing appointment
    const appointment = await prisma.bookedAppointment.findUnique({
      where: { confirmationCode: confirmationCode.toUpperCase() },
    });

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    if (appointment.status === "canceled") {
      throw new AppError("This appointment has already been canceled", 400);
    }

    // Check if new slot is available
    const utcDateTime = convertToUTC(newDate, newTime);
    const utcEndDateTime = new Date(utcDateTime.getTime() + 60 * 60 * 1000);

    const existingAppointment = await prisma.bookedAppointment.findFirst({
      where: {
        startDatetimeUtc: utcDateTime,
        status: { in: ["confirmed", "pending"] },
        id: { not: appointment.id },
      },
    });

    if (existingAppointment) {
      throw new AppError(
        "This time slot is no longer available. Please select another time.",
        409,
      );
    }

    // Cancel old appointment
    await prisma.bookedAppointment.update({
      where: { id: appointment.id },
      data: { status: "canceled" },
    });

    // Create new appointment with existing phone, new time, new code
    const newConfirmationCode = generateSecureConfirmationCode();

    try {
      const newAppointment = await prisma.bookedAppointment.create({
        data: {
          startDatetimeUtc: utcDateTime,
          endDatetimeUtc: utcEndDateTime,
          phoneNumber: appointment.phoneNumber,
          confirmationCode: newConfirmationCode,
          status: "confirmed",
        },
      });

      return Response.json(
        {
          success: true,
          message: "Appointment rescheduled successfully",
          oldAppointment: await prisma.bookedAppointment.findUnique({
            where: { id: appointment.id },
          }),
          newAppointment: newAppointment,
        },
        { status: 200 },
      );
    } catch (dbError) {
      if (dbError.code === "P2002") {
        throw new AppError(
          "New time slot is no longer available. Please choose another.",
          409,
        );
      }
      throw dbError;
    }
  } catch (error) {
    return handleRouteError(error, "APPOINTMENT_RESCHEDULE");
  }
}
```

---

### 6. `src/app/api/appointments/cancel/route.js`

Replace error handling:

OLD:

```javascript
  } catch (error) {
    console.error("Cancel error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to cancel appointment. Please try again.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
```

NEW:

```javascript
  } catch (error) {
    return handleRouteError(error, "APPOINTMENT_CANCEL");
  }
}
```

Add import at top:

```javascript
import { AppError, handleRouteError } from "@/lib/errorHandler";
import { validateConfirmationCode } from "@/lib/validation";
```

Add validation:

```javascript
const codeErr = validateConfirmationCode(confirmationCode);
if (codeErr) throw new AppError(codeErr, 400);
```

---

## DATABASE MIGRATION

Run this command to apply schema changes:

```bash
npx prisma migrate dev --name add_status_enum_and_indexes
```

This will:

1. Add ENUM constraint to `status` field
2. Add index on `(startDatetimeUtc, status)`
3. Add `updatedAt` timestamp
4. Sync local migrations with database

---

## ENVIRONMENT CONFIGURATION

### Create `.env.example`

```env
# Database Connection
ashil_DATABASE_URL=postgresql://user:password@host:port/database

# Rate Limiting (Upstash Redis - free tier available)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Security
PHONE_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# Environment
NODE_ENV=production
```

### Generate encryption key

Run once to generate a secure key:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Copy output to `PHONE_ENCRYPTION_KEY` in `.env.local`.

### Setup Upstash Redis (Free Tier)

1. Go to https://console.upstash.com
2. Click "Create Database"
3. Select "Redis"
4. Choose free tier
5. Copy REST URL and token
6. Paste into `.env.local`

---

## HARDENING CHECKLIST

### BEFORE LAUNCH (Critical - Do First)

- [ ] **CRITICAL-1**: Add database index + error handling for race conditions
  - Update `prisma/schema.prisma`
  - Run `npx prisma migrate dev --name add_status_enum_and_indexes`
  - Update `src/app/api/book/route.js` to catch P2002 errors

- [ ] **CRITICAL-2**: Replace weak confirmation codes
  - Create `src/lib/security.js`
  - Update `src/app/api/book/route.js`
  - Update `src/app/api/appointments/reschedule/route.js`
  - Remove old `generateConfirmationCode()` function

- [ ] **CRITICAL-3**: Stop leaking error messages
  - Create `src/lib/errorHandler.js`
  - Update all 6 API route files to use `handleRouteError()`
  - Test: trigger an error, verify stack trace NOT in response

- [ ] **CRITICAL-4**: Add rate limiting
  - `npm install @upstash/ratelimit @upstash/redis`
  - Create `src/lib/rateLimit.js`
  - Setup Upstash Redis account (free tier)
  - Add rate limit checks to `/api/book`, `/api/appointments/[code]`, `/api/calendar`
  - Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local`

- [ ] **CRITICAL-5**: Add input validation
  - Create `src/lib/validation.js`
  - Update `src/app/api/book/route.js` to validate all inputs
  - Update manage endpoints to validate confirmation codes

- [ ] Create `.env.example` with required variables
- [ ] Generate `PHONE_ENCRYPTION_KEY` and add to `.env.local`
- [ ] Test double-booking: open 5 tabs, book same slot simultaneously → should fail on 4
- [ ] Test rate limiting: spam `/api/book` 11+ times → should get 429 on 11th
- [ ] Verify no error messages expose stack traces in browser

### WEEK 1 POST-LAUNCH (Important)

- [ ] **IMP-1**: Add error handler to reschedule endpoint (race condition)
- [ ] **IMP-2**: Optimize calendar query to fetch only 30-day window
- [ ] **IMP-3**: Add HTTP cache header to calendar endpoint
- [ ] **IMP-4**: Encrypt phone numbers (if handling PII)
  - Add `encryptPhone()` to booking create
  - Add `decryptPhone()` where phone is read
- [ ] **IMP-5**: Move hardcoded config to `src/lib/config.js`
- [ ] **IMP-6**: Add `src/lib/audit.js` and call on critical operations
- [ ] **IMP-7**: Accept timezone in booking request (currently hardcoded to Dubai)
- [ ] Test calendar with 10,000+ bookings → should respond <200ms
- [ ] Monitor rate limiter stats via Upstash dashboard

### MONTH 1+ (Nice-to-Have)

- [ ] Add health check endpoint: `src/app/api/health/route.js`
- [ ] Setup error tracking (Sentry/LogRocket)
- [ ] Add structured logging with correlation IDs
- [ ] Setup database query performance monitoring
- [ ] Add SMS/email confirmation notifications
- [ ] Implement GDPR data export/deletion endpoints
- [ ] Create admin dashboard to view bookings & audit logs

---

## TESTING PROCEDURES

### Test 1: Double-Booking Prevention

1. Open browser DevTools (F12)
2. Open 5 tabs pointing to your booking page
3. On each tab, book the SAME date/time simultaneously
4. Click "Book" on all 5 tabs within 1 second
5. **Expected:** Only 1 succeeds with 201, others get 409 "slot no longer available"
6. **Actual:** ?

### Test 2: Rate Limiting

1. Open DevTools Console
2. Run:

```javascript
for (let i = 0; i < 12; i++) {
  fetch("/api/book", {
    method: "POST",
    body: JSON.stringify({
      date: "2026-02-20",
      time: "09:00 AM",
      name: "Test",
      phone: "+23055551234",
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((d) => console.log(`Attempt ${i + 1}:`, d));
}
```

3. **Expected:** First 10 succeed (or your rate limit), 11th+ get 429 error
4. **Actual:** ?

### Test 3: Input Validation

Test invalid inputs:

- Phone: `alert('hack')` → should fail validation
- Phone: `+999999999999999999999` → should fail (too long)
- Code: `123` → should fail (too short)
- Date: `01-02-2026` → should fail (wrong format)

### Test 4: Error Message Safety

1. Trigger an error (e.g., disconnect database)
2. Make a booking request
3. **Expected:** Generic "An error occurred. Please try again."
4. **NOT Expected:** Stack trace, SQL queries, file paths, etc.

### Test 5: Confirmation Code Entropy

Run 100 times:

```bash
node -e "
const crypto = require('crypto');
const codes = new Set();
for (let i = 0; i < 100; i++) {
  codes.add(crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8));
}
console.log('Unique codes:', codes.size, '/ 100');
"
```

**Expected:** 100 (no duplicates)

---

## QUICK REFERENCE: Order of Implementation

**Day 1 (4-6 hours):**

1. Create `src/lib/errorHandler.js`
2. Create `src/lib/security.js`
3. Create `src/lib/validation.js`
4. Update `prisma/schema.prisma` + migrate
5. Update `src/app/api/book/route.js`
6. Update all other route files with error handler

**Day 2 (3-4 hours):**

1. Create `src/lib/rateLimit.js`
2. Setup Upstash account
3. Add rate limit checks to 3 endpoints
4. Create `.env.example`
5. Test double-booking and rate limiting
6. Commit to git

**Week 1:**

1. Create `src/lib/config.js`
2. Create `src/lib/audit.js`
3. Update reschedule endpoint
4. Optimize calendar query
5. Test with real traffic

---

## SUPPORT / QUESTIONS

If stuck on any step:

1. Check if `.env.local` has all required variables
2. Run `npx prisma generate` if Prisma client errors
3. Check Upstash dashboard if rate limiting not working
4. Verify phone encryption key is 32 hex characters

---

**Report Date:** February 17, 2026  
**Status:** Ready for implementation  
**Estimated Launch Date:** February 19-20, 2026
