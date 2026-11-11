import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NotificationService } from '@core/feedback/notification.service';
import { AccessDeniedError } from '@shared/models/errors/access-denied.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ChatListStore } from './chat-list.store';
import { ConversationStore } from './conversation.store';
import { Conversation, Message, MessageDeletion, Presence } from './models/chat';
import { ActivityNotice } from './models/chat-activity';
import { ChatHub, ReadNotice } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

const conversation = (id: string, unread = 0): Conversation => ({
  id,
  otherUserId: 'them',
  name: 'Aziz',
  photoUrl: null,
  online: false,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageKind: null,
  lastMessageText: '',
  lastMessageOn: new Date(Number(id.length)),
  unreadCount: unread,
  canWrite: true,
});
const message = (id: string, sender: string, minute: number): Message => ({
  id,
  conversationId: 'c1',
  senderUserId: sender,
  kind: 'text',
  text: id,
  attachments: [],
  sentOn: new Date(2026, 9, 22, 10, minute),
});

const vipRequired = (): AccessDeniedError =>
  new AccessDeniedError('VIP required', 'Chat.SubscriptionRequired');

describe('chat stores', () => {
  const service = {
    conversations: vi.fn(),
    open: vi.fn(),
    messages: vi.fn(),
    send: vi.fn(),
    markRead: vi.fn(),
  };
  const notifications = { error: vi.fn() };
  const hub = {
    messages: new Subject<Message>(),
    deletions: new Subject<MessageDeletion>(),
    reads: new Subject<ReadNotice>(),
    activities: new Subject<ActivityNotice>(),
    presence: new Subject<Presence>(),
    reconnected: new Subject<void>(),
    start: vi.fn(),
    activity: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service.markRead.mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        ChatListStore,
        ConversationStore,
        { provide: ChatService, useValue: service },
        { provide: ChatHub, useValue: hub },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('should refresh the list and update presence when the hub speaks', async () => {
    const store = TestBed.inject(ChatListStore);
    service.conversations.mockResolvedValue([conversation('a')]);
    await store.load();
    service.conversations.mockResolvedValue([conversation('a', 3)]);

    hub.messages.next(message('x', 'them', 1));
    await vi.waitFor(() => expect(store.conversations()?.[0].unreadCount).toBe(3));
    hub.presence.next({ userId: 'them', isOnline: true, lastSeen: null });

    expect(store.conversations()?.[0].online).toBe(true);
  });

  it('should refresh the list when a message is deleted anywhere', async () => {
    const store = TestBed.inject(ChatListStore);
    service.conversations.mockResolvedValue([conversation('a', 2), conversation('bb')]);
    await store.load();
    service.conversations.mockResolvedValue([conversation('bb')]);

    hub.deletions.next({ conversationId: 'a', messageId: 'm1' });

    await vi.waitFor(() => expect(store.conversations()?.map((item) => item.id)).toEqual(['bb']));
  });

  it('should forget a message and drop the ones deleted while the hub was away', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({
      messages: [message('m3', 'me', 3), message('m2', 'them', 2), message('m1', 'me', 1)],
      otherReadUpTo: null,
    });
    await store.open({ conversationId: 'c1' });

    store.forget('m3');
    expect(store.messages().map((item) => item.id)).toEqual(['m2', 'm1']);
    service.messages.mockResolvedValue({ messages: [message('m1', 'me', 1)], otherReadUpTo: null });
    hub.reconnected.next();

    await vi.waitFor(() => expect(store.messages().map((item) => item.id)).toEqual(['m1']));
  });

  it('should open a conversation with a user and load its first page', async () => {
    const store = TestBed.inject(ConversationStore);
    service.open.mockResolvedValue({ conversationId: 'c1', canWrite: true });
    service.conversations.mockResolvedValue([
      { ...conversation('c1'), id: 'c1', name: 'Aziz Karimov' },
    ]);
    service.messages.mockResolvedValue({
      messages: [message('m1', 'them', 1)],
      otherReadUpTo: null,
    });

    await store.open({ userId: 'them', name: 'Aziz' });

    expect(store.opened()).toBe(true);
    expect(store.name()).toBe('Aziz Karimov');
    expect(store.otherUserId()).toBe('them');
    expect(service.markRead).toHaveBeenCalledWith('c1');
  });

  it('should add live messages of this conversation and ignore other ones', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    hub.messages.next(message('m1', 'them', 2));
    hub.messages.next({ ...message('m2', 'them', 3), conversationId: 'other' });

    expect(store.messages().map((item) => item.id)).toEqual(['m1']);
  });

  it('should show the read-only state without an error when opening is refused for the tier', async () => {
    const store = TestBed.inject(ConversationStore);
    service.open.mockRejectedValue(vipRequired());

    await store.open({ userId: 'them', name: 'Aziz' });

    expect(store.canWrite()).toBe(false);
    expect(store.loadError()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.conversationId()).toBeNull();
    expect(store.messages()).toEqual([]);
    expect(store.name()).toBe('Aziz');
    expect(service.conversations).not.toHaveBeenCalled();
    expect(service.messages).not.toHaveBeenCalled();
  });

  it('should show the load error when opening fails for another reason', async () => {
    const store = TestBed.inject(ConversationStore);
    service.open.mockRejectedValue(new ServiceUnavailableError());

    await store.open({ userId: 'them' });

    expect(store.loadError()).not.toBeNull();
    expect(store.canWrite()).toBe(true);
  });

  it('should show the load error when access is refused without the subscription code', async () => {
    const store = TestBed.inject(ConversationStore);
    service.open.mockRejectedValue(new AccessDeniedError());

    await store.open({ userId: 'them' });

    expect(store.loadError()).not.toBeNull();
    expect(store.canWrite()).toBe(true);
  });

  it('should show the other user activity for five seconds and update the read mark', async () => {
    vi.useFakeTimers();
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    hub.activities.next({ conversationId: 'c1', userId: 'them', activity: 'recordingVoice' });
    expect(store.activity()).toBe('recordingVoice');
    hub.activities.next({ conversationId: 'c1', userId: 'someone', activity: 'typing' });
    expect(store.activity()).toBe('recordingVoice');
    vi.advanceTimersByTime(5001);
    expect(store.activity()).toBeNull();

    hub.reads.next({ conversationId: 'c1', readerUserId: 'them', readUpTo: new Date(7) });
    expect(store.otherReadUpTo()).toEqual(new Date(7));
    vi.useRealTimers();
  });

  it('should clear the activity when a message from that user arrives', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    hub.activities.next({ conversationId: 'c1', userId: 'them', activity: 'typing' });
    hub.messages.next(message('m1', 'them', 2));

    expect(store.activity()).toBeNull();
  });

  it('should send activity only for an open writable conversation', async () => {
    const store = TestBed.inject(ConversationStore);
    store.notifyActivity('typing');
    expect(hub.activity).not.toHaveBeenCalled();
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({ messages: [], otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });

    store.typed();

    expect(hub.activity).toHaveBeenCalledWith('c1', 'typing');
  });

  it('should show the activity in the list for that conversation only', async () => {
    const store = TestBed.inject(ChatListStore);
    service.conversations.mockResolvedValue([conversation('a')]);
    await store.load();

    hub.activities.next({ conversationId: 'a', userId: 'them', activity: 'uploading' });
    hub.activities.next({ conversationId: 'a', userId: 'stranger', activity: 'typing' });

    expect(store.activities().get('a')).toBe('uploading');
  });

  it('should refetch the message page when its media fails to load', async () => {
    const store = TestBed.inject(ConversationStore);
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValue({
      messages: [message('m1', 'them', 1)],
      otherReadUpTo: null,
    });
    await store.open({ conversationId: 'c1' });
    service.messages.mockClear();

    store.mediaFailed('m1');
    store.mediaFailed('m1');

    await vi.waitFor(() => expect(service.messages).toHaveBeenCalledTimes(1));
    expect(service.messages).toHaveBeenCalledWith('c1', 20, new Date(2026, 9, 22, 10, 1, 0, 1));
  });

  it('should load an older page when there is more history', async () => {
    const store = TestBed.inject(ConversationStore);
    const page = Array.from({ length: 50 }, (_, index) => message(`m${index}`, 'them', index));
    service.conversations.mockResolvedValue([{ ...conversation('c1'), id: 'c1' }]);
    service.messages.mockResolvedValueOnce({ messages: page, otherReadUpTo: null });
    await store.open({ conversationId: 'c1' });
    service.messages.mockResolvedValueOnce({
      messages: [{ ...message('old', 'them', 0), sentOn: new Date(2020, 0, 1) }],
      otherReadUpTo: null,
    });

    await store.loadOlder();

    expect(store.messages()).toHaveLength(51);
    expect(store.hasOlder()).toBe(false);
  });
});
