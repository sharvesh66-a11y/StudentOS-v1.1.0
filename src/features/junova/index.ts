/**
 * StudentOS Junova AI — Feature Barrel
 *
 * Import Junova AI APIs from here:
 *   import { JunovaChat, TeacherList, teacherService, chatService } from '@/features/junova'
 */

// Components — Chat + Teacher (Phase 1)
export { JunovaChat } from './components/chat/junova-chat';
export { TeacherList } from './components/teacher/teacher-list';
export { TeacherCard } from './components/teacher/teacher-card';
export { TeacherForm } from './components/teacher/teacher-form';
export { TeacherDNAEditor } from './components/teacher/teacher-dna-editor';
export { MarkdownRenderer } from './components/chat/markdown-renderer';

// Components — Voice + Live Teacher (Phase 3)
export { VoiceConversationPanel } from './components/voice/voice-conversation-panel';
export { VoiceSettings } from './components/voice/voice-settings';
export { Avatar } from './components/live-teacher/avatar';
export { Whiteboard } from './components/live-teacher/whiteboard';
export { ClassroomLayout } from './components/live-teacher/classroom-layout';

// Services — Phase 1 + 2
export { teacherService } from './services/teacher.service';
export { chatService } from './services/chat.service';
export { memoryService } from './services/memory.service';
export { recommendationService } from './services/recommendation.service';
export { buildSystemPrompt } from './services/prompt-builder';

// Services — Phase 3
export { voiceService } from './services/voice.service';
export { getAvailableVoices, isTTSSupported } from './services/speech.service';
export { liveTeacherService } from './services/live-teacher.service';

// Hooks — Phase 1 + 2
export { useTeachers } from './hooks/use-teachers';
export { useConversations } from './hooks/use-conversations';
export { useStreamingChat } from './hooks/use-streaming-chat';
export { useVoiceInput } from './hooks/use-voice-input';
export { useMemory } from './hooks/use-memory';
export { useRecommendations } from './hooks/use-recommendations';

// Hooks — Phase 3
export { useSpeechSynthesis } from './hooks/use-speech-synthesis';
export { useVoiceConversation } from './hooks/use-voice-conversation';
export { useVoicePreferences } from './hooks/use-voice-preferences';
export { useLiveTeacher } from './hooks/use-live-teacher';

// Store
export { useJunovaStore } from './store/junova.store';

// Schemas
export {
  teacherFormSchema,
  DEFAULT_TEACHER_FORM,
  type TeacherFormValues,
} from './schemas/teacher.schema';

// Types
export type {
  AITeacher,
  TeacherDNA,
  Conversation,
  Message,
  MessageRole,
  MessageAttachment,
  PersonalityPreset,
  TeachingStyle,
  ChatRequest,
  ChatStreamChunk,
  // Phase 2
  StudentMemory,
  RevisionEntry,
  AIRecommendations,
  RecommendationResult,
  // Phase 3
  VoicePreferences,
  LiveSessionSettings,
  AvatarStyle,
  AvatarExpression,
  VoiceConversationState,
  VoiceMessage,
} from './types';

// Constants
export {
  PERSONALITY_PRESETS,
  TEACHING_STYLES,
  SUBJECTS,
  DNA_TRAITS,
  THEME_COLORS,
  DIFFICULTY_LEVELS,
} from './constants';
