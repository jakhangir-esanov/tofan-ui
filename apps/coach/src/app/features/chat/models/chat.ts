import { initialsOf } from '@coach/core/clients/client-activity';
import { daysBetween } from '@coach/core/format/formats';
import { Attachment, MessageKind, keepFreshUrls } from './chat-attachment';

export const CHAT_FILTERS = ['all', 'unread', 'read'] as const;
export type ChatFilter = (typeof CHAT_FILTERS)[number];

export const MESSAGE_MAX_LENGTH = 2000;
export const PAGE_SIZE = 50;

export interface Conversation {
  readonly id: string;
  readonly otherUserId: string;
  readonly name: string;
  readonly photoUrl: string | null;
  readonly online: boolean;
  readonly lastSeen: Date | null;
  readonly otherReadUpTo: Date | null;
  readonly lastMessageSenderId: string | null;
  readonly lastMessageKind: MessageKind | null;
  readonly lastMessageText: string;
  readonly lastMessageOn: Date | null;
  readonly unreadCount: number;
  readonly canWrite: boolean;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderUserId: string;
  readonly kind: MessageKind;
  readonly text: string;
  readonly attachments: readonly Attachment[];
  readonly sentOn: Date;
}

export interface MessageDeletion {
  readonly conversationId: string;
  readonly messageId: string;
}

export interface Presence {
  readonly userId: string;
  readonly isOnline: boolean;
  readonly lastSeen: Date | null;
}

export function newestFirst(conversations: readonly Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => (b.lastMessageOn?.getTime() ?? 0) - (a.lastMessageOn?.getTime() ?? 0),
  );
}

export function filterConversations(
  conversations: readonly Conversation[],
  filter: ChatFilter,
  query: string,
): Conversation[] {
  const needle = query.trim().toLowerCase();
  return conversations.filter((conversation) => {
    const unread = conversation.unreadCount > 0;
    const matches = filter === 'all' || (filter === 'unread' ? unread : !unread);
    return matches && (needle === '' || conversation.name.toLowerCase().includes(needle));
  });
}

export function applyPresence(
  conversations: readonly Conversation[],
  presence: Presence,
): Conversation[] {
  return conversations.map((conversation) =>
    conversation.otherUserId === presence.userId
      ? {
          ...conversation,
          online: presence.isOnline,
          lastSeen: presence.lastSeen ?? conversation.lastSeen,
        }
      : conversation,
  );
}

export function mergeMessages(
  incoming: readonly Message[],
  shown: readonly Message[],
  now: Date,
): Message[] {
  const shownById = new Map(shown.map((message) => [message.id, message]));
  const byId = new Map<string, Message>();
  for (const message of incoming) {
    if (!byId.has(message.id)) {
      byId.set(message.id, withKnownUrls(message, shownById.get(message.id), now));
    }
  }
  for (const message of shown) {
    if (!byId.has(message.id)) {
      byId.set(message.id, message);
    }
  }
  return [...byId.values()].sort((a, b) => b.sentOn.getTime() - a.sentOn.getTime());
}

export interface NewestPage {
  readonly messages: readonly Message[];
  readonly complete: boolean;
  readonly shownBefore: ReadonlySet<string>;
}

export function mergeNewestPage(page: NewestPage, shown: readonly Message[], now: Date): Message[] {
  const inPage = new Set(page.messages.map((message) => message.id));
  const oldest = page.complete
    ? Number.NEGATIVE_INFINITY
    : Math.min(...page.messages.map((message) => message.sentOn.getTime()));
  const kept = shown.filter(
    (message) =>
      inPage.has(message.id) ||
      !page.shownBefore.has(message.id) ||
      message.sentOn.getTime() < oldest,
  );
  return mergeMessages(page.messages, kept, now);
}

export function withoutMessage(messages: readonly Message[], messageId: string): Message[] {
  return messages.filter((message) => message.id !== messageId);
}

function withKnownUrls(message: Message, shown: Message | undefined, now: Date): Message {
  if (shown === undefined || message.attachments.length === 0) {
    return message;
  }
  const attachments = keepFreshUrls(message.attachments, shown.attachments, now);
  return attachments === message.attachments ? message : { ...message, attachments };
}

export function isMine(message: Message, otherUserId: string): boolean {
  return message.senderUserId !== otherUserId;
}

export function isRead(message: Message, readUpTo: Date | null): boolean {
  return readUpTo !== null && message.sentOn.getTime() <= readUpTo.getTime();
}

export function opensDay(messages: readonly Message[], index: number): boolean {
  const older = messages[index + 1];
  return older === undefined || daysBetween(older.sentOn, messages[index].sentOn) !== 0;
}

export function chatInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) {
    return '';
  }
  return (
    words.length === 1 ? words[0].slice(0, 2) : initialsOf(words[0], words[words.length - 1])
  ).toUpperCase();
}
