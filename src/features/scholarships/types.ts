/**
 * StudentOS Scholarship Finder — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Scholarship (library entry)
// ---------------------------------------------------------------------------

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  description: string;
  amount: string;
  eligibility: string[];
  requiredMarks: string;
  requiredClass: string;
  category: string;
  country: string;
  state: string;
  course: string;
  stream: string;
  deadline: string;
  applicationLink: string;
  officialWebsite: string;
  requiredDocuments: string[];
  tags: string[];
  featured: boolean;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Student Scholarship Profile
// ---------------------------------------------------------------------------

export interface ScholarshipProfile {
  uid: string;
  academicInfo: { grade: string; gpa: string; school: string; graduationYear: string };
  skills: string[];
  interests: string[];
  achievements: string[];
  incomeCategory: 'low' | 'middle' | 'high' | 'not-specified';
  preferredCountry: string;
  preferredCourse: string;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Saved/Applied Scholarships (student_scholarships)
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'saved' | 'applied' | 'pending' | 'approved' | 'rejected';

export interface StudentScholarship {
  id: string;
  uid: string;
  scholarshipId: string;
  scholarshipName: string;
  status: ApplicationStatus;
  notes: string;
  matchScore: number;
  deadline: string;
  appliedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// AI Recommendations
// ---------------------------------------------------------------------------

export interface ScholarshipRecommendation {
  uid: string;
  bestScholarships: { name: string; matchScore: number; reason: string }[];
  successProbability: number;
  missingEligibility: string[];
  requiredImprovements: string[];
  suggestedDocuments: string[];
  applicationTips: string[];
  generatedAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type ScholarshipNotificationType =
  | 'deadline_reminder'
  | 'new_scholarship'
  | 'eligibility_alert'
  | 'application_status'
  | 'ai_update';

export interface ScholarshipNotification {
  id: string;
  uid: string;
  type: ScholarshipNotificationType;
  title: string;
  message: string;
  scholarshipId: string | null;
  read: boolean;
  createdAt: number;
}
