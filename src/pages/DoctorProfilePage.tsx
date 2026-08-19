import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  Shield,
  Video,
  Building,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Globe,
  Stethoscope,
  Heart,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { providersAPI, type Provider, type ProviderReview } from '../services/providers.api';

// ─── Helper Components ────────────────────────────────────────────────────────

const InfoPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300">
    {icon}
    <span>{text}</span>
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center">
    <div className="text-slate-400 dark:text-slate-500 mb-2">{icon}</div>
    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
  </div>
);

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard: React.FC<{ review: ProviderReview }> = ({ review }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          {review.user?.name?.[0] || '?'}
        </div>
        <div>
          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{review.user?.name || 'Patient'}</span>
          {review.isVerified && (
            <span className="ml-1 text-xs text-emerald-500">✓ Verified</span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          />
        ))}
      </div>
    </div>
    {review.title && <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">{review.title}</h4>}
    <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
    <div className="mt-2 text-xs text-slate-400">
      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: doctor, isLoading, error } = useApiQuery<Provider>(
    `provider-${id}`,
    () => providersAPI.getById(id!),
    { enabled: !!id }
  );

  const { data: reviews, isLoading: reviewsLoading } = useApiQuery<ProviderReview[]>(
    `provider-reviews-${id}`,
    () => providersAPI.getReviews(id!, 10),
    { enabled: !!id }
  );

  // MediConnect Score computation
  const mediConnectScore = useMemo(() => {
    if (!doctor) return 0;
    let score = 50;
    if (doctor.rating >= 4.5) score += 20;
    else if (doctor.rating >= 4) score += 15;
    else if (doctor.rating >= 3.5) score += 10;
    if (doctor.isVerified) score += 10;
    if (doctor.totalReviews > 100) score += 10;
    else if (doctor.totalReviews > 50) score += 5;
    if (doctor.offersVideoConsultation) score += 5;
    if (doctor.specializations?.length > 3) score += 5;
    return Math.min(score, 100);
  }, [doctor]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load doctor profile</p>
          <Link to="/doctors" className="btn-primary text-sm">← Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/doctors" className="text-blue-200 hover:text-white text-sm flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {doctor.profileImage ? (
                <img src={doctor.profileImage} alt={doctor.firstName} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <Stethoscope className="h-12 w-12 text-white" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {doctor.title || 'Dr.'} {doctor.firstName} {doctor.lastName}
              </h1>
              <p className="text-blue-100 mt-1">
                {doctor.specializations?.join(' · ') || doctor.type}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {doctor.city && (
                  <span className="flex items-center text-blue-100 text-sm">
                    <MapPin className="h-4 w-4 mr-1" /> {doctor.city}{doctor.state ? `, ${doctor.state}` : ''}
                  </span>
                )}
                <div className="flex items-center text-white">
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300 mr-1" />
                  <span className="font-medium">{doctor.rating?.toFixed(1) || '—'}</span>
                  <span className="text-blue-200 ml-1 text-sm">({doctor.totalReviews} reviews)</span>
                </div>
                {doctor.isVerified && (
                  <span className="flex items-center text-emerald-300 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Verified Provider
                  </span>
                )}
              </div>

              {/* MediConnect Score */}
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <Shield className="h-5 w-5 text-emerald-300" />
                <span className="text-white font-medium">MediConnect Score: {mediConnectScore}/100</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 md:mt-0 mt-4">
              <Link
                to={`/virtual-consult?providerId=${doctor.id}`}
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                Book Appointment
              </Link>
              {doctor.offersVideoConsultation && (
                <Link
                  to={`/virtual-consult?providerId=${doctor.id}&type=video`}
                  className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Video className="h-4 w-4" /> Video Consult
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Years Experience" value={doctor.yearsOfExperience || '—'} icon={<Award className="h-5 w-5 mx-auto" />} />
          <StatCard label="Total Consultations" value={doctor.totalConsultations?.toLocaleString() || '0'} icon={<Stethoscope className="h-5 w-5 mx-auto" />} />
          <StatCard label="Patient Reviews" value={doctor.totalReviews?.toLocaleString() || '0'} icon={<Star className="h-5 w-5 mx-auto" />} />
          <StatCard label="Consultation Fee" value={doctor.consultationFee ? `₹${doctor.consultationFee.toLocaleString()}` : '—'} icon={<Calendar className="h-5 w-5 mx-auto" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {doctor.bio && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">About</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Specializations & Services */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Specializations & Services</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.specializations?.map((spec, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                    {spec}
                  </span>
                ))}
                {doctor.conditionsTreated?.map((cond, i) => (
                  <span key={`c-${i}`} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full font-medium">
                    {cond}
                  </span>
                ))}
                {doctor.proceduresPerformed?.map((proc, i) => (
                  <span key={`p-${i}`} className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full font-medium">
                    {proc}
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Awards */}
            {(doctor.education || (doctor.awards && doctor.awards.length > 0)) && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Education & Awards</h2>
                {doctor.education && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> Education
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{doctor.education}</p>
                  </div>
                )}
                {doctor.awards && doctor.awards.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Awards & Recognition
                    </h3>
                    <ul className="space-y-2">
                      {doctor.awards.map((award, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>{award.name}</strong> — {award.organization} ({award.year})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Patient Reviews ({doctor.totalReviews})
              </h2>
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-6">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {doctor.phone && (
                  <a href={`tel:${doctor.phone}`} className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" /> {doctor.phone}
                  </a>
                )}
                {doctor.email && (
                  <a href={`mailto:${doctor.email}`} className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" /> {doctor.email}
                  </a>
                )}
                {doctor.officeAddress && (
                  <div className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                    <Building className="h-4 w-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" /> {doctor.officeAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Consultation Type</span>
                  <span className="text-slate-900 dark:text-slate-100">
                    {[
                      doctor.offersVideoConsultation && 'Video',
                      doctor.offersInPersonConsultation && 'In-Person',
                      doctor.offersHomeVisit && 'Home Visit',
                    ].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="text-slate-900 dark:text-slate-100">{doctor.consultationDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Accepting New Patients</span>
                  <span className={doctor.acceptsNewPatients ? 'text-emerald-500' : 'text-red-500'}>
                    {doctor.acceptsNewPatients ? 'Yes' : 'No'}
                  </span>
                </div>
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Languages</span>
                    <span className="text-slate-900 dark:text-slate-100">{doctor.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            {doctor.certifications && doctor.certifications.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.certifications.map((cert, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
                      <Shield className="h-3 w-3" /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            {doctor.insuranceAccepted && doctor.insuranceAccepted.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Insurance Accepted</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.insuranceAccepted.map((ins, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full">
                      {ins}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
