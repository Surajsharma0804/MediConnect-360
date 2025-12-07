# 🚀 MediConnect 360 - Available API Endpoints

## ✅ System Status: FULLY OPERATIONAL

**Backend:** http://localhost:5000  
**Health Check:** http://localhost:5000/api/health  
**Database:** PostgreSQL ✅ Connected  
**Cache:** Redis ✅ Running  
**Storage:** MinIO ✅ Running  

---

## 📡 API Endpoints (190+ Available)

### 🏥 Health & System
- `GET /api/health` - System health check

### 🔐 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/me` - Current user profile

### 🤖 AI Features
- `POST /api/ai/symptom-check` - AI symptom analysis
- `POST /api/ai/chat` - AI health assistant
- `POST /api/ai/drug-interactions` - Drug interaction checker
- `GET /api/ai/drug-info` - FDA drug information
- `GET /api/ai/drug-recalls` - FDA drug recalls

### 🎤 Voice Chat (20+ Languages)
- `GET /api/ai/voice/languages` - Get supported languages
- `POST /api/ai/voice/symptom-check` - Voice symptom analysis
- `POST /api/ai/voice/chat` - Voice AI chat
- `POST /api/ai/voice/translate` - Text translation
- `POST /api/ai/voice/text-to-speech` - Convert text to speech

### 📋 Electronic Health Records (EHR)
**Medical History:**
- `GET /api/ehr/medical-history` - List all
- `POST /api/ehr/medical-history` - Create
- `GET /api/ehr/medical-history/:id` - Get one
- `PUT /api/ehr/medical-history/:id` - Update
- `DELETE /api/ehr/medical-history/:id` - Delete
- `GET /api/ehr/medical-history/search` - Search by condition

**Prescriptions:**
- `GET /api/ehr/prescriptions` - List all
- `POST /api/ehr/prescriptions` - Create
- `GET /api/ehr/prescriptions/:id` - Get one
- `PUT /api/ehr/prescriptions/:id` - Update
- `DELETE /api/ehr/prescriptions/:id` - Delete
- `POST /api/ehr/prescriptions/:id/refill` - Request refill
- `GET /api/ehr/prescriptions/due-for-refill` - Get refills due
- `GET /api/ehr/prescriptions/adherence` - Get adherence rate

**Lab Results:**
- `GET /api/ehr/lab-results` - List all
- `POST /api/ehr/lab-results` - Create
- `GET /api/ehr/lab-results/:id` - Get one
- `PUT /api/ehr/lab-results/:id` - Update
- `DELETE /api/ehr/lab-results/:id` - Delete
- `GET /api/ehr/lab-results/abnormal` - Get abnormal results
- `GET /api/ehr/lab-results/trends` - Get trends

**Vital Signs:**
- `GET /api/ehr/vitals` - List all
- `POST /api/ehr/vitals` - Create
- `POST /api/ehr/vitals/bulk` - Bulk import
- `GET /api/ehr/vitals/:id` - Get one
- `PUT /api/ehr/vitals/:id` - Update
- `DELETE /api/ehr/vitals/:id` - Delete
- `GET /api/ehr/vitals/latest` - Get latest
- `GET /api/ehr/vitals/trends` - Get trends

**Allergies:**
- `GET /api/ehr/allergies` - List all
- `POST /api/ehr/allergies` - Create
- `GET /api/ehr/allergies/:id` - Get one
- `PUT /api/ehr/allergies/:id` - Update
- `DELETE /api/ehr/allergies/:id` - Delete
- `GET /api/ehr/allergies/severe` - Get severe allergies
- `GET /api/ehr/allergies/check-conflicts` - Check medication conflicts

**Immunizations:**
- `GET /api/ehr/immunizations` - List all
- `POST /api/ehr/immunizations` - Create
- `GET /api/ehr/immunizations/:id` - Get one
- `PUT /api/ehr/immunizations/:id` - Update
- `DELETE /api/ehr/immunizations/:id` - Delete
- `GET /api/ehr/immunizations/due` - Get due vaccines
- `GET /api/ehr/immunizations/vaccine-card` - Get vaccine card

### 👨‍⚕️ Provider Directory
- `GET /api/providers` - List all providers
- `GET /api/providers/search` - Advanced search
- `GET /api/providers/nearby` - Find nearby (geo-location)
- `GET /api/providers/specializations` - Get all specializations
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider
- `PUT /api/providers/:id` - Update provider
- `DELETE /api/providers/:id` - Delete provider

**Provider Reviews:**
- `GET /api/providers/:providerId/reviews` - List reviews
- `POST /api/providers/:providerId/reviews` - Create review
- `GET /api/providers/:providerId/reviews/:id` - Get review
- `PUT /api/providers/:providerId/reviews/:id` - Update review
- `DELETE /api/providers/:providerId/reviews/:id` - Delete review
- `POST /api/providers/:providerId/reviews/:id/helpful` - Mark helpful

### 📅 Appointments & Scheduling
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List user appointments
- `GET /api/appointments/available-slots` - Get available time slots
- `GET /api/appointments/next-available` - Find next available slot
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `DELETE /api/appointments/:id` - Delete appointment

### 👨‍👩‍👧‍👦 Family Management
- `POST /api/family/members` - Add family member
- `GET /api/family/members` - List all family members
- `GET /api/family/members/minors` - Get minors only
- `GET /api/family/members/:id` - Get member details
- `PUT /api/family/members/:id` - Update member
- `DELETE /api/family/members/:id` - Remove member
- `POST /api/family/members/:id/access` - Grant access
- `DELETE /api/family/members/:id/access` - Revoke access
- `GET /api/family/members/:id/records` - View shared records

### 📊 Health Tracking (13 Types)
- `POST /api/health-tracking` - Log health data
- `GET /api/health-tracking` - Get tracking history
- `GET /api/health-tracking/stats` - Get analytics & trends
- `GET /api/health-tracking/:id` - Get specific entry
- `PUT /api/health-tracking/:id` - Update entry
- `DELETE /api/health-tracking/:id` - Delete entry

**Tracking Types:**
1. **FITNESS** - Steps, distance, calories, exercise
2. **SLEEP** - Duration, quality, sleep stages
3. **MOOD** - Mood levels, factors, notes
4. **PAIN** - Pain levels, location, triggers
5. **SYMPTOM** - Symptom diary with severity
6. **MEDICATION_ADHERENCE** - Pill reminders, tracking
7. **WEIGHT** - Weight, BMI, body fat, muscle mass
8. **NUTRITION** - Calories, macros, meals
9. **WATER** - Water intake tracking
10. **MENSTRUAL** - Period tracking, symptoms
11. **BLOOD_PRESSURE** - BP readings with pulse
12. **BLOOD_GLUCOSE** - Glucose monitoring
13. **HEART_RATE** - Heart rate tracking

### 💊 Pharmacy Integration (24 Endpoints)
**Pharmacy Locator:**
- `GET /api/pharmacy` - Search pharmacies (with filters)
- `GET /api/pharmacy/chains` - Get pharmacy chains
- `GET /api/pharmacy/search?name=` - Search by name
- `GET /api/pharmacy/:id` - Get pharmacy details
- `POST /api/pharmacy` - Add pharmacy (admin)
- `PUT /api/pharmacy/:id` - Update pharmacy (admin)
- `DELETE /api/pharmacy/:id` - Delete pharmacy (admin)

**E-Prescriptions:**
- `POST /api/e-prescriptions/send` - Send prescription to pharmacy
- `GET /api/e-prescriptions` - List user's e-prescriptions
- `GET /api/e-prescriptions/:id` - Get e-prescription details
- `PUT /api/e-prescriptions/:id/status` - Update status (pharmacy)
- `POST /api/e-prescriptions/:id/cancel` - Cancel e-prescription
- `POST /api/e-prescriptions/refill/:prescriptionId` - Request refill
- `POST /api/e-prescriptions/:id/transfer` - Transfer to another pharmacy

**Drug Prices & Savings:**
- `POST /api/drug-prices/compare` - Compare prices across pharmacies
- `GET /api/drug-prices/generic-alternatives` - Find generic alternatives
- `GET /api/drug-prices/coupons` - Get drug coupons (GoodRx style)
- `GET /api/drug-prices/savings` - Calculate brand vs generic savings
- `GET /api/drug-prices/pharmacy/:pharmacyId` - Get pharmacy's drug prices
- `POST /api/drug-prices` - Add drug price (admin)
- `PUT /api/drug-prices/:id` - Update drug price (admin)
- `DELETE /api/drug-prices/:id` - Delete drug price (admin)

**Features:**
- 🏪 Pharmacy locator with geo-location search
- 📱 E-prescription sending to any pharmacy
- 💰 Price comparison across pharmacies
- 💊 Generic alternatives finder
- 🎟️ Drug coupons & discount programs
- 🔄 Prescription refill requests
- 🚚 Home delivery support
- 📍 24/7 pharmacy finder
- ⭐ Pharmacy ratings & reviews
- 🏥 Insurance accepted tracking

### 💳 Insurance & Billing (40 Endpoints)
**Insurance Cards:**
- `POST /api/insurance/cards` - Add insurance card
- `POST /api/insurance/cards/scan` - Scan insurance card (OCR)
- `GET /api/insurance/cards` - List all cards
- `GET /api/insurance/cards/primary` - Get primary card
- `GET /api/insurance/cards/:id` - Get card details
- `PUT /api/insurance/cards/:id` - Update card
- `DELETE /api/insurance/cards/:id` - Delete card
- `POST /api/insurance/cards/:id/verify` - Verify insurance
- `POST /api/insurance/cards/:id/check-eligibility` - Check eligibility

**Insurance Claims:**
- `POST /api/insurance/claims` - Create claim
- `GET /api/insurance/claims` - List all claims
- `GET /api/insurance/claims/summary` - Get claims summary
- `GET /api/insurance/claims/:id` - Get claim details
- `POST /api/insurance/claims/:id/submit` - Submit claim
- `PUT /api/insurance/claims/:id/status` - Update claim status
- `POST /api/insurance/claims/:id/documents` - Upload claim document

**Invoices:**
- `POST /api/insurance/invoices` - Create invoice
- `GET /api/insurance/invoices` - List all invoices
- `GET /api/insurance/invoices/:id` - Get invoice details
- `POST /api/insurance/invoices/:id/pay` - Mark as paid
- `POST /api/insurance/invoices/:id/superbill` - Generate superbill

**Payment Plans:**
- `POST /api/insurance/payment-plans` - Create payment plan
- `GET /api/insurance/payment-plans` - List all plans
- `GET /api/insurance/payment-plans/:id` - Get plan details
- `POST /api/insurance/payment-plans/:id/payment` - Process payment

**HSA/FSA Accounts:**
- `POST /api/insurance/hsa-fsa` - Add HSA/FSA account
- `GET /api/insurance/hsa-fsa` - List all accounts
- `GET /api/insurance/hsa-fsa/:id` - Get account details
- `GET /api/insurance/hsa-fsa/:id/balance` - Get balance
- `POST /api/insurance/hsa-fsa/:id/transaction` - Process transaction

**Cost Estimator:**
- `GET /api/insurance/cost-estimator/services` - Get available services
- `POST /api/insurance/cost-estimator/estimate` - Estimate cost
- `POST /api/insurance/cost-estimator/compare` - Compare providers

**Features:**
- 📸 Insurance card scanner with OCR
- ✅ Real-time insurance verification
- 📋 Claims management & tracking
- 💰 Cost estimator for services
- 💳 Payment plans with auto-pay
- 🏦 HSA/FSA integration
- 📄 Superbill generation
- 📊 Invoice history
- 💵 Multi-currency support
- 🔔 Automated notifications

### 🔬 Lab & Diagnostics (30 Endpoints)
**Lab Test Orders:**
- `POST /api/lab-test-orders` - Order lab test
- `GET /api/lab-test-orders` - List all orders
- `GET /api/lab-test-orders/home-kits` - Get home test kits
- `GET /api/lab-test-orders/upcoming` - Get upcoming tests
- `GET /api/lab-test-orders/statistics` - Get statistics
- `GET /api/lab-test-orders/:id` - Get order details
- `PATCH /api/lab-test-orders/:id/status` - Update status
- `PATCH /api/lab-test-orders/:id/cancel` - Cancel order

**Imaging Studies:**
- `POST /api/imaging` - Order imaging study
- `GET /api/imaging` - List all studies
- `GET /api/imaging/statistics` - Get statistics
- `GET /api/imaging/modality/:modality` - Filter by modality
- `GET /api/imaging/:id` - Get study details
- `PATCH /api/imaging/:id/status` - Update status
- `POST /api/imaging/:id/upload-images` - Upload images
- `POST /api/imaging/:id/ai-analysis` - AI image analysis
- `POST /api/imaging/:id/report` - Add radiologist report

**Lab Results:**
- `POST /api/lab-results` - Add lab result
- `POST /api/lab-results/bulk` - Bulk import results
- `GET /api/lab-results` - List all results
- `GET /api/lab-results/abnormal` - Get abnormal results
- `GET /api/lab-results/critical` - Get critical results
- `GET /api/lab-results/statistics` - Get statistics
- `GET /api/lab-results/trend` - Get trend analysis
- `GET /api/lab-results/:id` - Get result details
- `POST /api/lab-results/:id/interpret` - AI interpretation
- `GET /api/lab-results/:id/compare` - Compare with previous

**Features:**
- 🧪 Lab test ordering (18 test types)
- 🏠 Home test kit ordering
- 🖼️ Imaging integration (X-ray, MRI, CT, Ultrasound, etc.)
- 🤖 AI-powered test interpretation
- 📈 Trend analysis over time
- 🚨 Abnormal result alerts
- 🔍 Lab comparison across facilities
- 📊 Reference ranges (age/gender specific)
- 📸 Medical image upload & storage
- 🩺 Radiologist report integration
- 🔔 Real-time notifications

### 🚑 Emergency Features
**Emergency Contacts:**
- `POST /api/emergency/contacts` - Add emergency contact
- `GET /api/emergency/contacts` - List all contacts
- `GET /api/emergency/contacts/primary` - Get primary contact
- `GET /api/emergency/contacts/:id` - Get contact details
- `PUT /api/emergency/contacts/:id` - Update contact
- `DELETE /api/emergency/contacts/:id` - Remove contact
- `PUT /api/emergency/contacts/reorder` - Reorder priority

**Medical ID:**
- `POST /api/emergency/medical-id` - Create medical ID
- `GET /api/emergency/medical-id` - Get medical ID
- `PUT /api/emergency/medical-id` - Update medical ID
- `GET /api/emergency/medical-id/public/:userId` - Public view (emergency)
- `POST /api/emergency/medical-id/toggle-visibility` - Toggle visibility

**SOS:**
- `POST /api/emergency/sos` - Trigger SOS
- `POST /api/emergency/sos/cancel` - Cancel SOS
- `GET /api/emergency/sos/status` - Get SOS status
- `POST /api/emergency/sos/location` - Share location

### 💬 Secure Messaging
**Messages:**
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:conversationId` - Get conversation messages
- `GET /api/messages/search` - Search messages
- `GET /api/messages/:id` - Get message details
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/read` - Mark message as read
- `POST /api/messages/conversation/:conversationId/read` - Mark all as read

**Conversations:**
- `POST /api/conversations` - Create conversation
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/unread-count` - Get unread count
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations/:id/participants` - Add participant
- `DELETE /api/conversations/:id/participants/:participantId` - Remove participant
- `POST /api/conversations/:id/read` - Mark conversation as read
- `DELETE /api/conversations/:id` - Delete conversation

### 💳 Payments
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/create-checkout-session` - Create checkout
- `POST /api/payment/webhook` - Stripe webhook

---

## 🎯 Implementation Progress

**Overall: 85% Complete**

✅ **Database Entities:** 100% (17/17)  
✅ **EHR Module:** 100% Complete  
✅ **Provider Module:** 100% Complete  
✅ **Voice Chat:** 100% Complete (20+ languages)  
✅ **Appointment Module:** 100% Complete  
✅ **Messaging Module:** 100% Complete  
✅ **Family Module:** 100% Complete  
✅ **Emergency Module:** 100% Complete  
✅ **Health Tracking:** 100% Complete (13 tracking types!)  
🚧 **Pharmacy Module:** Next (Phase 7)  
🚧 **Insurance Module:** Pending (Phase 8)  

---

## 🌍 Voice Chat Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Bengali, Tamil, Telugu, Marathi, Turkish, Vietnamese, Thai, Indonesian

---

**Total Endpoints:** 220+  
**Build Status:** ✅ No Errors  
**Server Status:** ✅ Running  
**Phase 9 Complete:** Lab & Diagnostics Module ✅
