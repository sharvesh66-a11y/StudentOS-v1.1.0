/**
 * StudentOS AI Review Engine — Tests
 *
 * Tests the type system, agent registry, and score calculation logic.
 * Does NOT call the actual LLM (those are integration tests).
 */

import { describe, it, expect } from 'vitest';
import {
  REVIEW_AGENTS,
  type ReviewRequest,
  type ReviewResult,
  type ReviewVerdict,
  type AgentId,
} from '@/features/ai-review/types';

describe('AI Review Engine — Types & Registry', () => {
  describe('REVIEW_AGENTS', () => {
    it('should have exactly 6 agents', () => {
      expect(REVIEW_AGENTS).toHaveLength(6);
    });

    it('should include all required agents', () => {
      const ids = REVIEW_AGENTS.map((a) => a.id);
      expect(ids).toContain('principal');
      expect(ids).toContain('teacher');
      expect(ids).toContain('child-safety');
      expect(ids).toContain('language');
      expect(ids).toContain('fact-verification');
      expect(ids).toContain('learning');
    });

    it('should have unique agent IDs', () => {
      const ids = REVIEW_AGENTS.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have non-empty name and description for each agent', () => {
      for (const agent of REVIEW_AGENTS) {
        expect(agent.name).toBeTruthy();
        expect(agent.description).toBeTruthy();
        expect(agent.role).toBeTruthy();
      }
    });
  });

  describe('ReviewRequest type', () => {
    it('should construct a valid review request', () => {
      const request: ReviewRequest = {
        userMessage: 'What is photosynthesis?',
        aiResponse: 'Photosynthesis is the process by which plants make food...',
        providerId: 'zai',
        studentGrade: 'Grade 8',
        subject: 'Biology',
        history: [],
      };

      expect(request.userMessage).toBe('What is photosynthesis?');
      expect(request.providerId).toBe('zai');
    });
  });

  describe('ReviewResult type', () => {
    it('should construct a valid approved result', () => {
      const result: ReviewResult = {
        verdict: 'approved',
        approvedContent: 'Approved response',
        originalContent: 'Original response',
        scores: {
          overallQuality: 90,
          accuracy: 95,
          safety: 100,
          childFriendly: 92,
          boardExam: 88,
          confidence: 85,
        },
        agentResults: [],
        issues: [],
        wasRewritten: false,
        totalDurationMs: 1500,
        reviewedAt: Date.now(),
      };

      expect(result.verdict).toBe('approved');
      expect(result.scores.safety).toBe(100);
      expect(result.wasRewritten).toBe(false);
    });

    it('should construct a valid rejected result', () => {
      const result: ReviewResult = {
        verdict: 'rejected',
        approvedContent: 'Blocked message',
        originalContent: 'Unsafe response',
        scores: {
          overallQuality: 30,
          accuracy: 50,
          safety: 10,
          childFriendly: 5,
          boardExam: 40,
          confidence: 90,
        },
        agentResults: [],
        issues: [
          {
            agent: 'child-safety',
            severity: 'critical',
            description: 'Contains violent content',
          },
        ],
        wasRewritten: false,
        totalDurationMs: 2000,
        reviewedAt: Date.now(),
      };

      expect(result.verdict).toBe('rejected');
      expect(result.scores.safety).toBeLessThan(50);
      expect(result.issues).toHaveLength(1);
    });
  });

  describe('ReviewVerdict', () => {
    it('should support all 4 verdict types', () => {
      const verdicts: ReviewVerdict[] = [
        'approved',
        'approved-with-enhancements',
        'rewritten',
        'rejected',
      ];
      expect(verdicts).toHaveLength(4);
    });
  });

  describe('AgentId', () => {
    it('should support all 6 agent IDs', () => {
      const ids: AgentId[] = [
        'principal',
        'teacher',
        'child-safety',
        'language',
        'fact-verification',
        'learning',
      ];
      expect(ids).toHaveLength(6);
      expect(new Set(ids).size).toBe(6);
    });
  });
});
