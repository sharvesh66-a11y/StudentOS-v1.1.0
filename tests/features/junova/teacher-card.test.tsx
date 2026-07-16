/**
 * Component tests for the Junova TeacherCard.
 *
 * The card has two variants (`sidebar` and `grid`). The card uses
 * `useJunovaStore` (Zustand) and `useTeachers` (which depends on `useAuth`).
 * We mock both hooks so the test stays focused on the rendering + click
 * behaviour of the card itself.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AITeacher } from '@/features/junova/types';

// --- Mocks --------------------------------------------------------------

const setActiveTeacher = vi.fn();
const setEditingTeacher = vi.fn();
const setShowTeacherForm = vi.fn();
const remove = vi.fn();

vi.mock('@/features/junova/store/junova.store', () => ({
  useJunovaStore: () => ({
    setActiveTeacher,
    setEditingTeacher,
    setShowTeacherForm,
    // The card also reads activeTeacher / showTeacherForm / editingTeacher
    // internally for other views, but TeacherCard only calls setters.
    activeTeacher: null,
    showTeacherForm: false,
    editingTeacher: null,
    setActiveConversation: vi.fn(),
  }),
}));

vi.mock('@/features/junova/hooks/use-teachers', () => ({
  useTeachers: () => ({
    teachers: [],
    isLoading: false,
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove,
  }),
}));

// Import AFTER mocks.
import { TeacherCard } from '@/features/junova/components/teacher/teacher-card';

// --- Fixtures ------------------------------------------------------------

const teacher: AITeacher = {
  id: 't1',
  uid: 'u1',
  name: 'Ada Lovelace',
  avatarURL: null,
  subject: 'Mathematics',
  preset: 'friendly-mentor',
  teachingStyle: 'socratic',
  bio: 'Pioneer of computing and early math educator.',
  themeColor: '#7c3aed',
  dna: {
    friendliness: 70,
    strictness: 50,
    humor: 40,
    explanationDepth: 60,
    patience: 80,
    motivation: 70,
    emojiUsage: 20,
    storytelling: 50,
    realLifeExamples: 60,
    examFocused: false,
    difficulty: 'intermediate',
  },
  createdAt: 0,
  updatedAt: 0,
};

beforeEach(() => {
  setActiveTeacher.mockReset();
  setEditingTeacher.mockReset();
  setShowTeacherForm.mockReset();
  remove.mockReset();
});

// --- Tests ---------------------------------------------------------------

describe('TeacherCard — grid variant', () => {
  it('renders the teacher name, subject and bio', () => {
    render(<TeacherCard teacher={teacher} variant="grid" />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText(/Pioneer of computing/)).toBeInTheDocument();
  });

  it('renders the "Start chatting" affordance', () => {
    render(<TeacherCard teacher={teacher} variant="grid" />);
    expect(screen.getByText('Start chatting')).toBeInTheDocument();
  });

  it('uses the teacher initials as the avatar fallback', () => {
    render(<TeacherCard teacher={teacher} variant="grid" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('calls setActiveTeacher + onSelect when the card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TeacherCard teacher={teacher} variant="grid" onSelect={onSelect} />);
    // Click on the card button (the outermost button element with the name).
    await user.click(screen.getByText('Ada Lovelace'));
    expect(setActiveTeacher).toHaveBeenCalledWith(teacher);
    expect(onSelect).toHaveBeenCalledWith(teacher);
  });

  it('applies the active styling + theme color border when isActive', () => {
    render(<TeacherCard teacher={teacher} variant="grid" isActive />);
    const card = screen.getByText('Ada Lovelace').closest('button');
    expect(card).not.toBeNull();
    // jsdom normalizes hex colors to rgb() when read back via .style.
    // We assert that the border color is non-empty and reflects the
    // themeColor's RGB equivalent (purple #7c3aed = rgb(124, 58, 237)).
    expect(card?.style.borderColor).toMatch(/124.*58.*237/);
  });

  it('renders the actions dropdown trigger with an aria-label mentioning the teacher name', () => {
    render(<TeacherCard teacher={teacher} variant="grid" />);
    expect(screen.getByLabelText(`Actions for ${teacher.name}`)).toBeInTheDocument();
  });

  it('omits the bio paragraph when bio is empty', () => {
    const noBio: AITeacher = { ...teacher, bio: '' };
    const { container } = render(<TeacherCard teacher={noBio} variant="grid" />);
    // Only check that there's no extra paragraph with the bio text.
    expect(container.textContent).not.toContain('Pioneer of computing');
  });
});

describe('TeacherCard — sidebar variant (default)', () => {
  it('renders the teacher name and subject', () => {
    render(<TeacherCard teacher={teacher} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('calls setActiveTeacher + onSelect on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TeacherCard teacher={teacher} onSelect={onSelect} />);
    await user.click(screen.getByText('Ada Lovelace'));
    expect(setActiveTeacher).toHaveBeenCalledWith(teacher);
    expect(onSelect).toHaveBeenCalledWith(teacher);
  });

  it('uses the initials as the avatar fallback', () => {
    render(<TeacherCard teacher={teacher} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders the actions dropdown trigger', () => {
    render(<TeacherCard teacher={teacher} />);
    expect(screen.getByLabelText(`Actions for ${teacher.name}`)).toBeInTheDocument();
  });

  it('renders the avatar image when avatarURL is set', () => {
    const withAvatar: AITeacher = { ...teacher, avatarURL: 'https://example.com/a.png' };
    render(<TeacherCard teacher={withAvatar} />);
    const img = screen.getByAltText('Ada Lovelace');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
  });
});
