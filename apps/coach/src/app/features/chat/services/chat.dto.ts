import { enumMap } from '@shared/utils/enum-map';
import { ChatActivity } from '../models/chat-activity';
import { MessageKind } from '../models/chat-attachment';

export enum MessageKindDto {
  Text = 1,
  Image = 2,
  File = 3,
  Voice = 4,
  VideoNote = 5,
}

export const messageKinds = enumMap<MessageKind, MessageKindDto>(MessageKindDto);

export enum ChatActivityDto {
  Typing = 1,
  RecordingVoice = 2,
  RecordingVideo = 3,
  Uploading = 4,
}

export const chatActivities = enumMap<ChatActivity, ChatActivityDto>(ChatActivityDto);

export interface ConversationResponse {
  id: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserPhotoUrl: string | null;
  otherIsOnline: boolean;
  otherLastSeenOnUtc: string | null;
  otherReadUpToUtc: string | null;
  lastMessageSenderUserId: string | null;
  lastMessageKind?: MessageKindDto | null;
  lastMessageText: string | null;
  lastMessageOnUtc: string | null;
  unreadCount: number;
  canWrite: boolean;
}

export interface MessageAttachmentResponse {
  fileId: string;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  waveform: number[] | null;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderUserId: string;
  kind?: MessageKindDto;
  text: string | null;
  sentOnUtc: string;
  attachments?: MessageAttachmentResponse[] | null;
}

export interface SendMessageRequest {
  text: string;
  attachments: string[];
}

export interface ConversationMessagesResponse {
  conversationId: string;
  otherReadUpToUtc: string | null;
  messages: MessageResponse[] | null;
}

export interface OpenConversationResponse {
  conversationId: string;
  canWrite: boolean;
}

export interface PresenceEvent {
  userId?: string;
  isOnline?: boolean;
  lastSeenOnUtc?: string | null;
}

export interface ReadEvent {
  conversationId?: string;
  readerUserId?: string;
  readUpToUtc?: string | null;
}

export interface ActivityEvent {
  conversationId?: string;
  userId?: string;
  activity?: ChatActivityDto;
}

export interface MessageDeletedEvent {
  conversationId?: string;
  messageId?: string;
  lastMessageSenderUserId?: string | null;
  lastMessageKind?: MessageKindDto | null;
  lastMessageText?: string;
  lastMessageOnUtc?: string | null;
}
