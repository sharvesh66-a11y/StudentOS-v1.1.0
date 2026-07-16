/**
 * Quiz Generation Flow test.
 *
 * Renders the QuizConfigForm and verifies:
 *   - The "Generate Quiz" button is disabled until a chapter is entered
 *     AND at least one question type is selected
 *   - Changing config calls onConfigChange with the right patch
 *   - Clicking "Generate Quiz" calls onGenerate
 *   - While isGenerating is true, the button shows a loading state and
 *     is disabled
 *
 * The form is a controlled component — typing into the chapter input
 * fires onConfigChange on every keystroke, but the displayed value
 * only updates if the parent re-renders with the new config. For tests
 * that exercise typing, we wrap QuizConfigForm in a small stateful
 * wrapper so the input behaves like a real controlled form.
 */
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizConfigForm } from '@/features/exam/components/quiz-config-form';
import { DEFAULT_QUIZ_CONFIG, type QuizConfig } from '@/features/exam/types';

/** Stateful wrapper so typing updates the config like a real parent would. */
function StatefulQuizConfigForm({
  initialConfig = { ...DEFAULT_QUIZ_CONFIG },
  onGenerate,
  isGenerating = false,
  onConfigChangeSpy,
}: {
  initialConfig?: QuizConfig;
  onGenerate?: () => void;
  isGenerating?: boolean;
  onConfigChangeSpy?: (patch: Partial<QuizConfig>) => void;
}) {
  const [config, setConfig] = React.useState<QuizConfig>(initialConfig);
  return (
    <QuizConfigForm
      config={config}
      onConfigChange={(patch) => {
        setConfig((c) => ({ ...c, ...patch }));
        onConfigChangeSpy?.(patch);
      }}
      onGenerate={onGenerate ?? (() => {})}
      isGenerating={isGenerating}
    />
  );
}

describe('Quiz Generation flow', () => {
  it('renders the form with subject, chapter, difficulty, question types, count, time limit', () => {
    render(
      <QuizConfigForm
        config={{ ...DEFAULT_QUIZ_CONFIG }}
        onConfigChange={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );

    expect(screen.getByText('Generate a Quiz')).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chapter/i)).toBeInTheDocument();
    expect(screen.getByText('Difficulty')).toBeInTheDocument();
    expect(screen.getByText('Question Types')).toBeInTheDocument();
    expect(screen.getByText('Number of Questions')).toBeInTheDocument();
    expect(screen.getByText('Time Limit')).toBeInTheDocument();
  });

  it('disables the Generate button when the chapter is empty', () => {
    render(
      <QuizConfigForm
        config={{ ...DEFAULT_QUIZ_CONFIG, chapter: '' }}
        onConfigChange={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );
    expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeDisabled();
  });

  it('disables the Generate button when no question types are selected', () => {
    render(
      <QuizConfigForm
        config={{ ...DEFAULT_QUIZ_CONFIG, chapter: 'Ch 1', questionTypes: [] }}
        onConfigChange={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );
    expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeDisabled();
  });

  it('enables the Generate button when a chapter is entered AND a question type is selected', () => {
    render(
      <QuizConfigForm
        config={{ ...DEFAULT_QUIZ_CONFIG, chapter: 'Ch 1', questionTypes: ['mcq'] }}
        onConfigChange={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );
    expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeEnabled();
  });

  it('calls onConfigChange with the chapter value when the user types', async () => {
    const user = userEvent.setup();
    const onConfigChangeSpy = vi.fn();
    render(<StatefulQuizConfigForm onConfigChangeSpy={onConfigChangeSpy} />);

    const chapterInput = screen.getByLabelText(/Chapter/i);
    await user.type(chapterInput, 'Photosynthesis');

    // The final onConfigChange call should carry the fully-typed chapter.
    const lastCall = onConfigChangeSpy.mock.calls[onConfigChangeSpy.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({ chapter: 'Photosynthesis' });
  });

  it('calls onConfigChange({ difficulty }) when a difficulty button is clicked', async () => {
    const user = userEvent.setup();
    const onConfigChangeSpy = vi.fn();
    render(
      <StatefulQuizConfigForm
        initialConfig={{ ...DEFAULT_QUIZ_CONFIG, difficulty: 'medium' }}
        onConfigChangeSpy={onConfigChangeSpy}
      />,
    );

    await user.click(screen.getByRole('button', { name: /^Hard$/ }));

    expect(onConfigChangeSpy).toHaveBeenCalledWith({ difficulty: 'hard' });
  });

  it('toggles a question type on/off when its button is clicked', async () => {
    const user = userEvent.setup();
    const onConfigChangeSpy = vi.fn();
    render(
      <StatefulQuizConfigForm
        initialConfig={{ ...DEFAULT_QUIZ_CONFIG, questionTypes: ['mcq'] }}
        onConfigChangeSpy={onConfigChangeSpy}
      />,
    );

    // Click "True / False" — should add it.
    await user.click(screen.getByText('True / False'));
    expect(onConfigChangeSpy).toHaveBeenLastCalledWith({
      questionTypes: ['mcq', 'true-false'],
    });
  });

  it('removes a question type when clicked again', async () => {
    const user = userEvent.setup();
    const onConfigChangeSpy = vi.fn();
    render(
      <StatefulQuizConfigForm
        initialConfig={{ ...DEFAULT_QUIZ_CONFIG, questionTypes: ['mcq', 'true-false'] }}
        onConfigChangeSpy={onConfigChangeSpy}
      />,
    );

    await user.click(screen.getByText('Multiple Choice'));
    expect(onConfigChangeSpy).toHaveBeenLastCalledWith({
      questionTypes: ['true-false'],
    });
  });

  it('calls onGenerate when the Generate button is clicked', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(
      <StatefulQuizConfigForm
        initialConfig={{ ...DEFAULT_QUIZ_CONFIG, chapter: 'Ch 1', questionTypes: ['mcq'] }}
        onGenerate={onGenerate}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Generate Quiz/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state and disables the button while isGenerating is true', () => {
    render(
      <QuizConfigForm
        config={{ ...DEFAULT_QUIZ_CONFIG, chapter: 'Ch 1', questionTypes: ['mcq'] }}
        onConfigChange={() => {}}
        onGenerate={() => {}}
        isGenerating={true}
      />,
    );

    const btn = screen.getByRole('button', { name: /Generating Quiz/i });
    expect(btn).toBeDisabled();
    expect(btn.textContent).toMatch(/Generating Quiz/);
  });
});
