/**
 * Component tests for the Quiz Results view.
 *
 * Verifies:
 *   - Score, correct/total, points and time are displayed
 *   - Pass vs fail messaging differs
 *   - Retry + Back buttons fire their handlers
 *   - Per-question review renders for every question in the quiz
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizResults } from '@/features/exam/components/quiz-results';
import type { Quiz, QuizResult } from '@/features/exam/types';

// --- Fixtures ------------------------------------------------------------

const quiz: Quiz = {
  id: 'q1',
  uid: 'u1',
  title: 'Algebra Basics',
  subject: 'Mathematics',
  chapter: 'Ch 1',
  difficulty: 'easy',
  questionCount: 2,
  questionTypes: ['mcq', 'true-false'],
  timeLimitMinutes: 0,
  aiGenerated: true,
  status: 'completed',
  questions: [
    {
      id: 'qq1',
      type: 'mcq',
      text: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      correctAnswer: '4',
      explanation: '2 + 2 = 4.',
      subject: 'Mathematics',
      topic: 'Addition',
      difficulty: 'easy',
      points: 1,
    },
    {
      id: 'qq2',
      type: 'true-false',
      text: 'The sun is a star.',
      correctAnswer: 'true',
      explanation: 'The sun is a G-type main-sequence star.',
      subject: 'Science',
      topic: 'Astronomy',
      difficulty: 'easy',
      points: 1,
    },
  ],
  createdAt: 0,
  updatedAt: 0,
};

const passingResult: QuizResult = {
  attemptId: 'a1',
  quizId: 'q1',
  score: 100,
  correctCount: 2,
  totalQuestions: 2,
  pointsEarned: 2,
  totalPoints: 2,
  timeSpentSeconds: 75, // 1m 15s
  questionResults: [
    {
      questionId: 'qq1',
      studentAnswer: '4',
      correctAnswer: '4',
      isCorrect: true,
      isSkipped: false,
      pointsEarned: 1,
      explanation: '2 + 2 = 4.',
    },
    {
      questionId: 'qq2',
      studentAnswer: 'true',
      correctAnswer: 'true',
      isCorrect: true,
      isSkipped: false,
      pointsEarned: 1,
      explanation: 'The sun is a G-type main-sequence star.',
    },
  ],
  weakTopics: [],
  strongTopics: ['Addition', 'Astronomy'],
};

const failingResult: QuizResult = {
  ...passingResult,
  score: 50,
  correctCount: 1,
  totalQuestions: 2,
  pointsEarned: 1,
  questionResults: [
    passingResult.questionResults[0],
    {
      questionId: 'qq2',
      studentAnswer: 'false',
      correctAnswer: 'true',
      isCorrect: false,
      isSkipped: false,
      pointsEarned: 0,
      explanation: 'The sun is a G-type main-sequence star.',
    },
  ],
  weakTopics: ['Astronomy'],
  strongTopics: ['Addition'],
};

// --- Tests ---------------------------------------------------------------

describe('QuizResults', () => {
  it('renders the score as a percentage', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders the correct / total count and points', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/2 \/ 2 correct/)).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 2 points/)).toBeInTheDocument();
  });

  it('formats the time spent as Xm Ys', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText('1m 15s')).toBeInTheDocument();
  });

  it('shows the passing message when score >= 60', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/Great job! You passed/)).toBeInTheDocument();
  });

  it('shows the encouraging message when score < 60', () => {
    render(<QuizResults quiz={quiz} result={failingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/Keep practicing/)).toBeInTheDocument();
  });

  it('shows the count of strong topics when present', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/2 strong topics/)).toBeInTheDocument();
  });

  it('shows the count of weak topics when present', () => {
    render(<QuizResults quiz={quiz} result={failingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText(/1 weak topics/)).toBeInTheDocument();
  });

  it('renders the Retry button and fires onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={onRetry} onExit={() => {}} />);
    const retryBtn = screen.getByRole('button', { name: /Retry Quiz/ });
    await user.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the Back button and fires onExit', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={onExit} />);
    const backBtn = screen.getByRole('button', { name: /Back to Quizzes/ });
    await user.click(backBtn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('renders the "Detailed Results" section with one review block per question', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText('Detailed Results')).toBeInTheDocument();
    // Each question's text should be visible.
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('The sun is a star.')).toBeInTheDocument();
  });

  it('renders the "✓ Correct!" indicator for correctly answered questions', () => {
    render(<QuizResults quiz={quiz} result={passingResult} onRetry={() => {}} onExit={() => {}} />);
    // Both questions were correct in the passing result.
    const correctIndicators = screen.getAllByText('✓ Correct!');
    expect(correctIndicators).toHaveLength(2);
  });

  it('renders the "✗ Not quite." indicator for wrong answers and shows the correct answer', () => {
    render(<QuizResults quiz={quiz} result={failingResult} onRetry={() => {}} onExit={() => {}} />);
    expect(screen.getByText('✗ Not quite.')).toBeInTheDocument();
    // The correct-answer reveal should be visible.
    expect(screen.getByText(/Correct answer:/)).toBeInTheDocument();
  });
});
