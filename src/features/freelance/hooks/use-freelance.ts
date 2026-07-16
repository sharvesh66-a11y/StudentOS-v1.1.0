'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { freelanceService } from '../services/freelance.service';
import type {
  FreelanceProfile,
  FreelanceJob,
  JobApplication,
  Project,
  PortfolioItem,
  Earning,
} from '../types';
import { toast } from 'sonner';

export function useFreelance() {
  const { user, profile } = useAuth();
  const [freelanceProfile, setFreelanceProfile] = useState<FreelanceProfile | null>(null);
  const [jobs, setJobs] = useState<FreelanceJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const u1 = freelanceService.subscribeToJobs(setJobs);
    const u2 = freelanceService.subscribeToMyApplications(user.uid, setApplications);
    const u3 = freelanceService.subscribeToMyProjects(user.uid, setProjects);
    const u4 = freelanceService.subscribeToPortfolio(user.uid, setPortfolio);
    const u5 = freelanceService.subscribeToEarnings(user.uid, setEarnings);
    void freelanceService.getProfile(user.uid).then((r) => {
      if (r.success) setFreelanceProfile(r.data ?? null);
      setIsLoading(false);
    });
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
    };
  }, [user]);

  const updateFreelanceProfile = useCallback(
    async (updates: Partial<FreelanceProfile>) => {
      if (!user || !profile) return;
      const data: Partial<FreelanceProfile> = {
        ...updates,
        uid: user.uid,
        displayName: profile.displayName ?? 'Student',
        photoURL: profile.photoURL ?? null,
      };
      await freelanceService.updateProfile(user.uid, data);
      setFreelanceProfile((prev) => ({
        ...(prev ?? {
          uid: user.uid,
          displayName: '',
          photoURL: null,
          bio: '',
          skills: [],
          experience: [],
          education: '',
          languages: [],
          certifications: [],
          socialLinks: [],
          availability: 'available' as const,
          hourlyRate: 0,
          resumeURL: null,
          rating: 0,
          totalProjects: 0,
          createdAt: 0,
          updatedAt: 0,
        }),
        ...data,
      }));
      toast.success('Profile updated');
    },
    [user, profile],
  );

  const apply = useCallback(
    async (job: FreelanceJob, proposal: string, coverLetter: string) => {
      if (!user || !profile) return;
      await freelanceService.applyForJob({
        jobId: job.id,
        jobTitle: job.title,
        uid: user.uid,
        displayName: profile.displayName ?? 'Student',
        photoURL: profile.photoURL ?? null,
        proposal,
        coverLetter,
        portfolioURL: null,
        resumeURL: null,
        status: 'pending',
      });
      toast.success('Application submitted!');
    },
    [user, profile],
  );

  const generateAI = useCallback(
    async (type: 'proposal' | 'cover-letter', jobTitle: string, jobDescription: string) => {
      if (!user) return '';
      try {
        const res = await authedFetch('/api/freelance/generate-proposal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            jobTitle,
            jobDescription,
            skills: freelanceProfile?.skills ?? [],
            bio: freelanceProfile?.bio ?? '',
            studentName: freelanceProfile?.displayName ?? 'Student',
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`${type === 'proposal' ? 'Proposal' : 'Cover letter'} generated!`);
          return data.text;
        }
        toast.error('AI generation failed', {
          description: data.error ?? 'Unknown error',
        });
        return '';
      } catch (err) {
        toast.error('AI generation failed', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
        return '';
      }
    },
    [user, freelanceProfile],
  );

  const addPortfolioItem = useCallback(
    async (data: Partial<PortfolioItem>) => {
      if (!user) return;
      await freelanceService.createPortfolioItem(user.uid, data);
      toast.success('Portfolio item added');
    },
    [user],
  );

  return {
    freelanceProfile,
    jobs,
    applications,
    projects,
    portfolio,
    earnings,
    isLoading: user ? isLoading : false,
    updateFreelanceProfile,
    apply,
    generateAI,
    addPortfolioItem,
  };
}
