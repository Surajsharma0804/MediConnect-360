// Service Barrel Export
// Central re-export of all API services for clean imports
// Usage: import { appointmentsAPI, providersAPI } from '../services';

export { default as api } from './api';
export { appointmentsAPI } from './appointments.api';
export { providersAPI } from './providers.api';
export { healthTrackingAPI } from './health-tracking.api';
export { documentsAPI } from './documents.api';
export { emergencyAPI } from './emergency.api';
export { pharmacyAPI } from './pharmacy.api';
export { messagingAPI } from './messaging.api';
export { labAPI } from './lab.api';
export { insuranceAPI } from './insurance.api';
export { familyAPI } from './family.api';
export { remindersAPI } from './reminders.api';
export { paymentAPI } from './payment.api';

// Re-export types
export type { Appointment, AppointmentStatus, AppointmentType, TimeSlot } from './appointments.api';
export type { Provider, ProviderType, ProviderStatus, ProviderReview, ProviderSearchFilters } from './providers.api';
export type { HealthTracking, TrackingType, TrackingStats } from './health-tracking.api';
export type { MedicalDocument, DocumentType, DocumentStatus } from './documents.api';
export type { SOSAlert, EmergencyContact, MedicalID } from './emergency.api';
export type { Pharmacy, Prescription, DrugPrice } from './pharmacy.api';
export type { Conversation, Message } from './messaging.api';
export type { LabTestOrder, LabTestResult } from './lab.api';
export type { InsuranceCard, InsuranceClaim } from './insurance.api';
export type { FamilyMember } from './family.api';
export type { Reminder, ReminderType } from './reminders.api';
export type { PaymentIntent, Subscription, SubscriptionPlan, Invoice } from './payment.api';
