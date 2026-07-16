'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { authedFetch } from '@/lib/api-client';
import { careerService } from '../services/career.service';
import type {
  CareerGoal,
  CareerSkill,
  CareerCollege,
  CareerRecommendation,
  CareerTimelineEntry,
} from '../types';
import { toast } from 'sonner';

export function useCareer() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [skills, setSkills] = useState<CareerSkill[]>([]);
  const [colleges, setColleges] = useState<CareerCollege[]>([]);
  const [timeline, setTimeline] = useState<CareerTimelineEntry[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = careerService.subscribeToGoals(user.uid, setGoals);
    const u2 = careerService.subscribeToSkills(user.uid, setSkills);
    const u3 = careerService.subscribeToColleges(user.uid, setColleges);
    const u4 = careerService.subscribeToTimeline(user.uid, setTimeline);
    void careerService.getRecommendations(user.uid).then((r) => {
      if (r.success) setRecommendations(r.data ?? null);
      setIsLoading(false);
    });
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [user]);

  const generateRecommendations = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const res = await authedFetch('/api/career/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          skills: skills.map((s) => s.name),
          goals: goals.map((g) => g.title),
        }),
      });
      const data = await res.json();
      setIsGenerating(false);
      if (data.success) {
        await careerService.saveRecommendations(user.uid, data.recommendations);
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
  }, [user, skills, goals]);

  return {
    goals,
    skills,
    colleges,
    timeline,
    recommendations,
    isLoading: user ? isLoading : false,
    isGenerating,
    generateRecommendations,
    createGoal: (d: Parameters<typeof careerService.createGoal>[1]) =>
      user ? careerService.createGoal(user.uid, d) : Promise.resolve({ success: false }),
    updateGoal: careerService.updateGoal,
    deleteGoal: careerService.deleteGoal,
    createSkill: (d: Parameters<typeof careerService.createSkill>[1]) =>
      user ? careerService.createSkill(user.uid, d) : Promise.resolve({ success: false }),
    updateSkill: careerService.updateSkill,
    deleteSkill: careerService.deleteSkill,
    createCollege: (d: Parameters<typeof careerService.createCollege>[1]) =>
      user ? careerService.createCollege(user.uid, d) : Promise.resolve({ success: false }),
    updateCollege: careerService.updateCollege,
    deleteCollege: careerService.deleteCollege,
  };
}
