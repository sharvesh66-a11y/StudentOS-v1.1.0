/** StudentOS Groups — Feature Barrel */
export { StudyGroupsView } from './components/study-groups-view';
export { groupService } from './services/group.service';
export { chatService } from './services/chat.service';
export { useGroups, useGroupMembers } from './hooks/use-groups';
export { useGroupChat, useGroupNotifications } from './hooks/use-chat';
export type {
  StudyGroup,
  GroupMember,
  MemberRole,
  GroupMessage,
  GroupSession,
  GroupFile,
  GroupNotification,
  CreateGroupConfig,
} from './types';
