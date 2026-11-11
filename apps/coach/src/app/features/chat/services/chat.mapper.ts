import { toDateOrNull } from '@coach/core/payments/payment.mapper';
import { Conversation, Message, MessageDeletion, Presence } from '../models/chat';
import { ActivityNotice } from '../models/chat-activity';
import { Attachment, MessageKind } from '../models/chat-attachment';
import {
  ActivityEvent,
  ConversationResponse,
  MessageAttachmentResponse,
  MessageDeletedEvent,
  MessageKindDto,
  MessageResponse,
  PresenceEvent,
  chatActivities,
  messageKinds,
} from './chat.dto';

export type ApiUrl = (path: string) => string;

export function toConversation(response: ConversationResponse, apiUrl: ApiUrl): Conversation {
  return {
    id: response.id,
    otherUserId: response.otherUserId,
    name: response.otherUserName?.trim() ?? '',
    photoUrl: response.otherUserPhotoUrl ? apiUrl(response.otherUserPhotoUrl) : null,
    online: response.otherIsOnline,
    lastSeen: toDateOrNull(response.otherLastSeenOnUtc),
    otherReadUpTo: toDateOrNull(response.otherReadUpToUtc),
    lastMessageSenderId: response.lastMessageSenderUserId,
    lastMessageKind:
      response.lastMessageKind === null || response.lastMessageKind === undefined
        ? null
        : toKind(response.lastMessageKind),
    lastMessageText: response.lastMessageText?.trim() ?? '',
    lastMessageOn: toDateOrNull(response.lastMessageOnUtc),
    unreadCount: response.unreadCount,
    canWrite: response.canWrite,
  };
}

export function toMessage(response: MessageResponse, apiUrl: ApiUrl): Message {
  return {
    id: response.id,
    conversationId: response.conversationId,
    senderUserId: response.senderUserId,
    kind: response.kind === undefined ? 'text' : toKind(response.kind),
    text: response.text ?? '',
    attachments: (response.attachments ?? []).map((attachment) => toAttachment(attachment, apiUrl)),
    sentOn: new Date(response.sentOnUtc),
  };
}

export function toPresence(event: PresenceEvent): Presence | null {
  return event.userId
    ? {
        userId: event.userId,
        isOnline: event.isOnline === true,
        lastSeen: toDateOrNull(event.lastSeenOnUtc),
      }
    : null;
}

export function toActivityNotice(event: ActivityEvent): ActivityNotice | null {
  const activity =
    event.activity === undefined ? null : chatActivities.toDomainOrNull(event.activity);
  if (!event.conversationId || !event.userId || activity === null) {
    return null;
  }
  return { conversationId: event.conversationId, userId: event.userId, activity };
}

export function toMessageDeletion(event: MessageDeletedEvent): MessageDeletion | null {
  if (!event.conversationId || !event.messageId) {
    return null;
  }
  return { conversationId: event.conversationId, messageId: event.messageId };
}

function toKind(kind: MessageKindDto): MessageKind {
  return messageKinds.toDomainOrNull(kind) ?? 'text';
}

function toAttachment(response: MessageAttachmentResponse, apiUrl: ApiUrl): Attachment {
  return {
    fileId: response.fileId,
    url: apiUrl(response.url),
    fileName: response.fileName,
    contentType: response.contentType,
    sizeBytes: response.sizeBytes,
    durationSeconds: response.durationSeconds,
    width: response.width,
    height: response.height,
    waveform: response.waveform ?? [],
  };
}
