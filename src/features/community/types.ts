/**
 * StudentOS Student Community — Domain Types
 * @see docs/DATABASE.md for the Firestore schema reference.
 */

// ---------------------------------------------------------------------------
// Community Profile
// ---------------------------------------------------------------------------

export interface CommunityProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  coverURL: string | null;
  bio: string;
  skills: string[];
  interests: string[];
  education: string;
  achievements: string[];
  xp: number;
  level: number;
  badges: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reputationScore: number;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export type PostType = 'text' | 'image' | 'pdf' | 'video' | 'poll' | 'link' | 'note';

export interface CommunityPost {
  id: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  type: PostType;
  content: string;
  mediaURL: string | null;
  mediaType: string | null;
  linkURL: string | null;
  pollOptions: { id: string; text: string; votes: string[] }[];
  communityId: string | null;
  isPinned: boolean;
  isBookmarked: boolean;
  reactions: Record<string, string[]>;
  commentsCount: number;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export interface CommunityComment {
  id: string;
  postId: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  parentId: string | null;
  reactions: Record<string, string[]>;
  attachments: { type: string; url: string; filename: string }[];
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Communities
// ---------------------------------------------------------------------------

export type CommunityPrivacy = 'public' | 'private';

export interface Community {
  id: string;
  name: string;
  description: string;
  subject: string;
  privacy: CommunityPrivacy;
  rules: string[];
  memberCount: number;
  createdBy: string;
  createdByName: string;
  coverURL: string | null;
  iconURL: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type CommunityRole = 'owner' | 'moderator' | 'member';

export interface CommunityMember {
  id: string;
  communityId: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  role: CommunityRole;
  joinedAt: number;
}

// ---------------------------------------------------------------------------
// Follow
// ---------------------------------------------------------------------------

export interface FollowEntry {
  id: string;
  followerUid: string;
  followingUid: string;
  followerName: string;
  followingName: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type CommunityNotificationType =
  'follow' | 'like' | 'comment' | 'reply' | 'mention' | 'invite' | 'announcement';

export interface CommunityNotification {
  id: string;
  uid: string;
  type: CommunityNotificationType;
  title: string;
  message: string;
  fromUid: string;
  fromName: string;
  postId: string | null;
  communityId: string | null;
  read: boolean;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export type ReportType = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

export interface CommunityReport {
  id: string;
  reporterUid: string;
  reporterName: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'helpful', emoji: '💡', label: 'Helpful' },
  { id: 'genius', emoji: '🧠', label: 'Genius' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebrate' },
] as const;
