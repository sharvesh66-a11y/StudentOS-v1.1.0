/**
 * StudentOS Student Freelancing — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Student Profile
// ---------------------------------------------------------------------------

export interface FreelanceProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  skills: string[];
  experience: string[];
  education: string;
  languages: string[];
  certifications: { name: string; issuer: string; year: string }[];
  socialLinks: { platform: string; url: string }[];
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  resumeURL: string | null;
  rating: number;
  totalProjects: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';

export interface FreelanceJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  skillsRequired: string[];
  deadline: string;
  clientName: string;
  clientUid: string;
  experienceLevel: ExperienceLevel;
  isRemote: boolean;
  isFeatured: boolean;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  proposal: string;
  coverLetter: string;
  portfolioURL: string | null;
  resumeURL: string | null;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectStatus = 'active' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  jobId: string;
  title: string;
  studentUid: string;
  studentName: string;
  clientUid: string;
  clientName: string;
  budget: number;
  status: ProjectStatus;
  progress: number;
  milestones: ProjectMilestone[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  completed: boolean;
  completedAt: number | null;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface FreelanceMessage {
  id: string;
  projectId: string;
  uid: string;
  displayName: string;
  content: string;
  attachments: { type: string; url: string; filename: string }[];
  readBy: string[];
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export interface PortfolioItem {
  id: string;
  uid: string;
  title: string;
  description: string;
  imageURL: string | null;
  projectURL: string | null;
  skillsUsed: string[];
  clientFeedback: string | null;
  rating: number | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface Review {
  id: string;
  projectId: string;
  reviewerUid: string;
  reviewerName: string;
  reviewedUid: string;
  rating: number;
  comment: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Earnings
// ---------------------------------------------------------------------------

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Earning {
  id: string;
  uid: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  status: PaymentStatus;
  paidAt: number | null;
  createdAt: number;
}
