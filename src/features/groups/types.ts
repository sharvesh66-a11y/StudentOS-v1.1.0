/**
 * StudentOS Study Groups — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export type GroupPrivacy = 'public' | 'private';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  classLevel: string;
  language: string;
  privacy: GroupPrivacy;
  tags: string[];
  coverImageURL: string | null;
  avatarURL: string | null;
  maxMembers: number;
  memberCount: number;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';

export interface GroupMember {
  id: string;
  groupId: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  role: MemberRole;
  joinedAt: number;
  isOnline: boolean;
  lastSeenAt: number;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export interface GroupMessage {
  id: string;
  groupId: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  content: string;
  replyTo: string | null;
  isEdited: boolean;
  isPinned: boolean;
  reactions: Record<string, string[]>;
  readBy: string[];
  attachments: MessageAttachment[];
  createdAt: number;
  updatedAt: number;
}

export interface MessageAttachment {
  type: 'image' | 'pdf' | 'note' | 'document' | 'voice';
  url: string;
  filename: string;
  size: number;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface GroupSession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledAt: number;
  durationMinutes: number;
  status: SessionStatus;
  attendees: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface GroupFile {
  id: string;
  groupId: string;
  uid: string;
  uploadedByName: string;
  type: 'image' | 'pdf' | 'note' | 'document' | 'voice';
  url: string;
  filename: string;
  size: number;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type GroupNotificationType =
  | 'new_message'
  | 'group_invitation'
  | 'join_request'
  | 'session_reminder'
  | 'file_shared'
  | 'member_joined';

export interface GroupNotification {
  id: string;
  uid: string;
  groupId: string;
  groupName: string;
  type: GroupNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface CreateGroupConfig {
  name: string;
  description: string;
  subject: string;
  classLevel: string;
  language: string;
  privacy: GroupPrivacy;
  tags: string[];
  maxMembers: number;
}

export const DEFAULT_GROUP_CONFIG: CreateGroupConfig = {
  name: '',
  description: '',
  subject: 'Mathematics',
  classLevel: '',
  language: 'en',
  privacy: 'public',
  tags: [],
  maxMembers: 50,
};
