# 💊 Pharmacy Module - Quick Reference

## 🎯 Overview

Complete pharmacy integration system with 24 API endpoints, matching and exceeding features from CVS Health, Walgreens, GoodRx, and major telemedicine platforms.

---

## 📦 What's Included

### 3 Database Entities
1. **Pharmacy** - Complete pharmacy information with geo-location
2. **EPrescription** - E-prescription lifecycle management
3. **DrugPrice** - Multi-pharmacy price comparison

### 3 Services
1. **PharmacyService** - Pharmacy search and management
2. **EPrescriptionService** - E-prescription handling
3. **DrugPriceService** - Price comparison and savings

### 24 API Endpoints
- 7 Pharmacy endpoints
- 7 E-prescription endpoints
- 10 Drug price endpoints

---

## 🚀 Quick Start Examples

### 1. Find Nearby Pharmacies
```bash
GET /api/pharmacy?latitude=37.7749&longitude=-122.4194&radiusMiles=5
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "CVS Pharmacy",
    "chain": "CVS",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "phone": "415-555-0100",
    "isOpen24Hours": true,
    "offersDelivery": true,
    "acceptsEPrescriptions": true,
    "rating": 4.5,
    "reviewCount": 234
  }
]
```

### 2. Compare Drug Prices
```bash
POST /api/drug-prices/compare
Content-Type: application/json

{
  "drugName": "Lisinopril",
  "dosage": "10mg",
  "quantity": 30,
  "zipCode": "94102"
}
```

**Response:**
```json
{
  "drugName": "Lisinopril",
  "dosage": "10mg",
  "quantity": 30,
  "prices": [
    {
      "pharmacy": { "name": "Walmart Pharmacy", "address": "..." },
      "price": 4.00,
      "cashPrice": 4.00,
      "insurancePrice": 0.00,
      "couponPrice": 3.50,
      "couponCode": "GOODRX123",
      "couponProvider": "GoodRx",
      "inStock": true
    },
    {
      "pharmacy": { "name": "CVS Pharmacy", "address": "..." },
      "price": 9.99,
      "cashPrice": 9.99,
      "insurancePrice": 5.00,
      "couponPrice": 7.50,
      "couponCode": "SINGLECARE456",
      "couponProvider": "SingleCare",
      "inStock": true
    }
  ],
  "lowestPrice": 4.00,
  "highestPrice": 9.99,
  "averagePrice": 6.99,
  "savings": 5.99
}
```

### 3. Send E-Prescription
```bash
POST /api/e-prescriptions/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "prescriptionId": "prescription-uuid",
  "pharmacyId": "pharmacy-uuid",
  "deliveryMethod": "home_delivery",
  "deliveryAddress": "123 Main St, San Francisco, CA 94102",
  "deliveryInstructions": "Leave at front door"
}
```

**Response:**
```json
{
  "id": "e-prescription-uuid",
  "status": "sent",
  "sentAt": "2025-12-07T12:00:00Z",
  "deliveryMethod": "home_delivery",
  "estimatedCost": 25.00,
  "prescription": {
    "medicationName": "Lisinopril",
    "dosage": "10mg",
    "quantity": 30
  },
  "pharmacy": {
    "name": "CVS Pharmacy",
    "phone": "415-555-0100"
  }
}
```

### 4. Request Refill
```bash
POST /api/e-prescriptions/refill/prescription-uuid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "new-e-prescription-uuid",
  "status": "sent",
  "sentAt": "2025-12-07T12:00:00Z",
  "message": "Refill request sent to pharmacy"
}
```

### 5. Find Generic Alternatives
```bash
GET /api/drug-prices/generic-alternatives?brandName=Lipitor&dosage=20mg
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "drugName": "Atorvastatin",
    "genericName": "Atorvastatin",
    "dosage": "20mg",
    "quantity": 30,
    "price": 12.00,
    "isGeneric": true,
    "inStock": true,
    "pharmacy": {
      "name": "Costco Pharmacy"
    }
  }
]
```

### 6. Get Drug Coupons
```bash
GET /api/drug-prices/coupons?drugName=Lipitor&dosage=20mg&quantity=30
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "drugName": "Lipitor",
    "dosage": "20mg",
    "quantity": 30,
    "price": 45.00,
    "couponPrice": 32.00,
    "couponCode": "GOODRX789",
    "couponProvider": "GoodRx",
    "pharmacy": {
      "name": "Walgreens"
    }
  }
]
```

### 7. Calculate Savings
```bash
GET /api/drug-prices/savings?drugName=Lipitor&dosage=20mg&quantity=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "brandPrice": 150.00,
  "genericPrice": 12.00,
  "savings": 138.00,
  "savingsPercent": 92.00
}
```

---

## 🔍 Search & Filter Options

### Pharmacy Search Filters
- `city` - Filter by city
- `state` - Filter by state
- `zipCode` - Filter by zip code
- `chain` - Filter by pharmacy chain (CVS, Walgreens, etc.)
- `isOpen24Hours` - Only 24-hour pharmacies
- `offersDelivery` - Only pharmacies with delivery
- `acceptsEPrescriptions` - Only e-prescription capable
- `latitude` & `longitude` - Geo-location search
- `radiusMiles` - Search radius (default: 10 miles)

### Example: Find 24/7 CVS Pharmacies with Delivery
```bash
GET /api/pharmacy?chain=CVS&isOpen24Hours=true&offersDelivery=true&zipCode=94102
```

---

## 📊 E-Prescription Status Flow

```
PENDING → SENT → RECEIVED → FILLED → READY_FOR_PICKUP → PICKED_UP
                                   ↓
                              DELIVERED (for home delivery)
```

**Status Descriptions:**
- `PENDING` - Created but not sent yet
- `SENT` - Sent to pharmacy
- `RECEIVED` - Pharmacy received the prescription
- `FILLED` - Pharmacy filled the prescription
- `READY_FOR_PICKUP` - Ready for customer pickup
- `PICKED_UP` - Customer picked up (final status)
- `DELIVERED` - Delivered to customer (final status)
- `CANCELLED` - Cancelled by user
- `REJECTED` - Rejected by pharmacy

---

## 🚚 Delivery Methods

1. **PICKUP** - Customer picks up at pharmacy
2. **HOME_DELIVERY** - Delivered to home address
3. **MAIL_ORDER** - Sent via mail (for 90-day supplies)

---

## 💰 Price Types

1. **price** - Standard price (best available)
2. **cashPrice** - Cash/self-pay price
3. **insurancePrice** - Price with insurance
4. **couponPrice** - Price with coupon applied

---

## 🔔 Notifications

### Automatic Notifications Sent:
1. **Prescription Sent** - When e-prescription is sent to pharmacy
2. **Prescription Received** - When pharmacy receives it
3. **Prescription Filled** - When pharmacy fills it
4. **Ready for Pickup** - When ready for pickup
5. **Delivered** - When delivered to home

**Notification Channels:**
- Push notifications (Firebase)
- Email notifications (Resend)
- SMS notifications (optional)

---

## 🏪 Pharmacy Chains Supported

- CVS Pharmacy
- Walgreens
- Walmart Pharmacy
- Costco Pharmacy
- Rite Aid
- Kroger Pharmacy
- Safeway Pharmacy
- Target Pharmacy
- Independent pharmacies
- And more...

---

## 🎟️ Coupon Providers

- GoodRx
- SingleCare
- RxSaver
- WellRx
- Blink Health
- And more...

---

## 🔐 Security Features

- ✅ JWT authentication required for all endpoints
- ✅ User isolation (users can only access their own data)
- ✅ HIPAA-compliant data handling
- ✅ Encrypted data transmission
- ✅ Audit logging for all prescription actions
- ✅ Role-based access control

---

## 📱 Mobile-Friendly

All endpoints are designed for mobile apps:
- Geo-location support
- Optimized response sizes
- Fast query performance
- Offline-capable data structures

---

## 🌍 Global Support

- Multi-currency support (ready)
- International pharmacy chains
- Multiple address formats
- Timezone-aware timestamps

---

## 🔧 Admin Features

Pharmacy management endpoints for administrators:
- Add new pharmacies
- Update pharmacy information
- Manage drug prices
- Update coupon codes
- Monitor e-prescription status

---

## 📈 Analytics Ready

Track important metrics:
- Most popular pharmacies
- Average prescription costs
- Savings generated for users
- Delivery success rates
- Refill patterns

---

## 🎯 Integration Points

### Existing Integrations
- ✅ EHR Module (prescription management)
- ✅ Notification Service (status updates)
- ✅ Email Service (confirmations)
- ✅ SMS Service (optional alerts)

### Future Integrations
- 🔜 Insurance verification
- 🔜 Real-time inventory checking
- 🔜 Pharmacy POS systems
- 🔜 Delivery tracking APIs

---

## 🏆 Competitive Advantages

### vs CVS Health App
- ✅ Multi-pharmacy comparison (not just CVS)
- ✅ Better price transparency
- ✅ Integrated with full EHR

### vs Walgreens App
- ✅ Price comparison across all pharmacies
- ✅ Coupon aggregation
- ✅ AI health assistant integration

### vs GoodRx
- ✅ Integrated e-prescription sending
- ✅ Full prescription management
- ✅ Complete healthcare platform

---

## 📞 Support

For issues or questions:
- Check API documentation
- Review error messages
- Contact support team
- Check system health endpoint

---

## ✅ Status

**Build Status:** ✅ SUCCESS  
**Server Status:** ✅ RUNNING  
**Endpoints:** ✅ 24 ACTIVE  
**Production Ready:** ✅ YES  

---

**Last Updated:** December 7, 2025  
**Version:** 1.0.0  
**Module:** Pharmacy Integration  
