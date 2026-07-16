/**
 * StudentOS Career Planner — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Career Profile (library entry)
// ---------------------------------------------------------------------------

export interface Career {
  id: string;
  title: string;
  description: string;
  stream: string;
  skills: string[];
  subjects: string[];
  educationPath: string[];
  salaryRange: string;
  jobDemand: 'low' | 'medium' | 'high' | 'very-high';
  futureGrowth: 'declining' | 'stable' | 'growing' | 'rapid';
  workEnvironment: string;
  topCompanies: string[];
  icon: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Career Goal
// ---------------------------------------------------------------------------

export type GoalStatus = 'active' | 'achieved' | 'abandoned';

export interface CareerGoal {
  id: string;
  uid: string;
  title: string;
  description: string;
  careerId: string | null;
  status: GoalStatus;
  progress: number;
  milestones: Milestone[];
  targetDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt: number | null;
}

// ---------------------------------------------------------------------------
// Skill Tracker
// ---------------------------------------------------------------------------

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CareerSkill {
  id: string;
  uid: string;
  name: string;
  category: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number;
  certificates: Certificate[];
  createdAt: number;
  updatedAt: number;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  url: string | null;
  earnedAt: number;
}

// ---------------------------------------------------------------------------
// College Planning
// ---------------------------------------------------------------------------

export interface CareerCollege {
  id: string;
  uid: string;
  name: string;
  country: string;
  program: string;
  entranceExams: string[];
  admissionRequirements: string[];
  fees: string;
  scholarships: string[];
  deadline: string | null;
  isDream: boolean;
  status: 'considering' | 'applying' | 'applied' | 'accepted' | 'rejected';
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// AI Recommendations
// ---------------------------------------------------------------------------

export interface CareerRecommendation {
  uid: string;
  bestNextStep: string | null;
  recommendedCourses: string[];
  recommendedBooks: string[];
  recommendedCertifications: string[];
  practicePlans: string[];
  skillImprovements: string[];
  careerSuggestions: string[];
  learningPath: string[];
  generatedAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Career Progress (timeline)
// ---------------------------------------------------------------------------

export interface CareerTimelineEntry {
  id: string;
  uid: string;
  type: 'school' | 'exam' | 'college' | 'career';
  title: string;
  description: string;
  date: string;
  completed: boolean;
  createdAt: number;
}
