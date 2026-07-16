'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { scholarshipService } from '../services/scholarship.service';
import type {
  Scholarship,
  StudentScholarship,
  ScholarshipProfile,
  ScholarshipRecommendation,
  ScholarshipNotification,
} from '../types';
import { toast } from 'sonner';

export function useScholarships() {
  const { user } = useAuth();
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [myScholarships, setMyScholarships] = useState<StudentScholarship[]>([]);
  const [profile, setProfile] = useState<ScholarshipProfile | null>(null);
  const [recommendations, setRecommendations] = useState<ScholarshipRecommendation | null>(null);
  const [notifications, setNotifications] = useState<ScholarshipNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = scholarshipService.subscribeToScholarships(setAllScholarships);
    const u2 = scholarshipService.subscribeToStudentScholarships(user.uid, (s) => {
      setMyScholarships(s);
      setIsLoading(false);
    });
    const u3 = scholarshipService.subscribeToNotifications(user.uid, setNotifications);
    void scholarshipService.getProfile(user.uid).then((r) => {
      if (r.success) setProfile(r.data ?? null);
    });
    void scholarshipService.getRecommendations(user.uid).then((r) => {
      if (r.success) setRecommendations(r.data ?? null);
    });
    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  const save = useCallback(
    async (s: Scholarship) => {
      if (!user) return;
      await scholarshipService.saveScholarship(user.uid, s);
      toast.success('Scholarship saved');
    },
    [user],
  );
  const updateStatus = useCallback(async (id: string, status: StudentScholarship['status']) => {
    await scholarshipService.updateStudentScholarship(id, {
      status,
      appliedAt: status === 'applied' ? Date.now() : null,
    });
  }, []);
  const remove = useCallback(async (id: string) => {
    await scholarshipService.removeStudentScholarship(id);
    toast.success('Removed');
  }, []);
  const updateProfile = useCallback(
    async (updates: Partial<ScholarshipProfile>) => {
      if (!user) return;
      await scholarshipService.updateProfile(user.uid, updates);
      setProfile((prev) => ({
        ...(prev ?? {
          uid: user.uid,
          academicInfo: { grade: '', gpa: '', school: '', graduationYear: '' },
          skills: [],
          interests: [],
          achievements: [],
          incomeCategory: 'not-specified' as const,
          preferredCountry: '',
          preferredCourse: '',
          updatedAt: 0,
        }),
        ...updates,
      }));
      toast.success('Profile updated');
    },
    [user],
  );

  const generateRecs = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const res = await authedFetch('/api/scholarships/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });
      const data = await res.json();
      setIsGenerating(false);
      if (data.success) {
        setRecommendations(data.recommendations);
        toast.success('AI recommendations generated!');
      } else {
        toast.error('Failed to generate recommendations', {
          description: data.error ?? 'Unknown error',
        });
      }
    } catch (err) {
      setIsGenerating(false);
      toast.error('Failed to generate recommendations', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [user]);

  return {
    allScholarships,
    myScholarships,
    profile,
    recommendations,
    notifications,
    isLoading: user ? isLoading : false,
    isGenerating,
    save,
    updateStatus,
    remove,
    updateProfile,
    generateRecs,
  };
}
