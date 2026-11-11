import {
  Conversation,
  Message,
  applyPresence,
  chatInitials,
  filterConversations,
  isMine,
  isRead,
  mergeMessages,
  mergeNewestPage,
  newestFirst,
  opensDay,
  withoutMessage,
} from './chat';

const conversation = (
  id: string,
  name: string,
  unread: number,
  on: number | null,
): Conversation => ({
  id,
  otherUserId: `u-${id}`,
  name,
  photoUrl: null,
  online: false,
  lastSeen: null,
  otherReadUpTo: null,
  lastMessageSenderId: null,
  lastMessageKind: null,
  lastMessageText: '',
  lastMessageOn: on === null ? null : new Date(on),
  unreadCount: unread,
  canWrite: true,
});
const message = (id: string, sender: string, at: string): Message => ({
  id,
  conversationId: 'c',
  senderUserId: sender,
  kind: 'text',
  text: id,
  attachments: [],
  sentOn: new Date(at),
});
const signedUrl = (fileId: string, expires: number): string =>
  `/api/files/${fileId}/content?expires=${expires}&signature=s${expires}`;
const withImage = (base: Message, url: string): Message => ({
  ...base,
  kind: 'image',
  attachments: [
    {
      fileId: 'f1',
      url,
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 10,
      durationSeconds: null,
      width: 800,
      height: 600,
      waveform: [],
    },
  ],
});

describe('conversation rules', () => {
  const list = [
    conversation('a', 'Aziz', 0, 100),
    conversation('b', 'Bobur', 2, 300),
    conversation('c', 'Lola', 0, null),
  ];

  it('should list the newest conversation first and chats without messages last', () => {
    expect(newestFirst(list).map((item) => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('should filter by read state and by name', () => {
    expect(filterConversations(list, 'unread', '').map((item) => item.id)).toEqual(['b']);
    expect(filterConversations(list, 'read', 'LO').map((item) => item.id)).toEqual(['c']);
  });

  it('should update only the matching user on a presence event', () => {
    const next = applyPresence(list, { userId: 'u-a', isOnline: true, lastSeen: new Date(5) });

    expect(next[0]).toMatchObject({ online: true, lastSeen: new Date(5) });
    expect(next[1].online).toBe(false);
  });
});

describe('message rules', () => {
  it('should merge without duplicates and sort newest first', () => {
    const a = message('a', 'me', '2026-10-22T10:00:00Z');
    const b = message('b', 'them', '2026-10-22T11:00:00Z');

    expect(mergeMessages([b], [a, b], new Date()).map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('should keep the shown file url when it is still valid', () => {
    const now = new Date('2026-11-09T10:00:00Z');
    const inAnHour = now.getTime() / 1000 + 3600;
    const shown = withImage(message('a', 'me', '2026-11-09T09:00:00Z'), signedUrl('f1', inAnHour));
    const incoming = withImage(shown, signedUrl('f1', inAnHour + 3600));

    expect(mergeMessages([incoming], [shown], now)[0].attachments[0].url).toBe(
      signedUrl('f1', inAnHour),
    );
  });

  it('should take the new file url when the shown one has expired', () => {
    const now = new Date('2026-11-09T10:00:00Z');
    const expired = now.getTime() / 1000 - 10;
    const shown = withImage(message('a', 'me', '2026-11-09T09:00:00Z'), signedUrl('f1', expired));
    const incoming = withImage(shown, signedUrl('f1', expired + 7200));

    expect(mergeMessages([incoming], [shown], now)[0].attachments[0].url).toBe(
      signedUrl('f1', expired + 7200),
    );
  });

  it('should know who wrote it and whether the other side read it', () => {
    const sent = message('a', 'me', '2026-10-22T10:00:00Z');

    expect(isMine(sent, 'them')).toBe(true);
    expect(isRead(sent, new Date('2026-10-22T10:00:00Z'))).toBe(true);
    expect(isRead(sent, new Date('2026-10-22T09:00:00Z'))).toBe(false);
    expect(isRead(sent, null)).toBe(false);
  });

  it('should open a day separator when the older message is from another day', () => {
    const list = [
      message('3', 'a', '2026-10-22T10:00:00'),
      message('2', 'a', '2026-10-22T08:00:00'),
      message('1', 'a', '2026-10-21T20:00:00'),
    ];

    expect([0, 1, 2].map((index) => opensDay(list, index))).toEqual([false, true, true]);
  });
});

describe('chatInitials', () => {
  it('should use two letters for one word and first plus last for several', () => {
    expect(chatInitials('aziz')).toBe('AZ');
    expect(chatInitials(' Aziz  Karim  Rahimov ')).toBe('AR');
    expect(chatInitials('')).toBe('');
  });
});

describe('message removal rules', () => {
  const at = (hour: number): string => `2026-10-22T${String(hour).padStart(2, '0')}:00:00Z`;
  const ids = (messages: readonly Message[]): string[] => messages.map((item) => item.id);
  const shownIds = (messages: readonly Message[]): ReadonlySet<string> => new Set(ids(messages));

  it('should drop only the message with the given id when one is removed', () => {
    const shown = [message('b', 'me', at(11)), message('a', 'them', at(10))];

    expect(ids(withoutMessage(shown, 'b'))).toEqual(['a']);
    expect(ids(withoutMessage(shown, 'missing'))).toEqual(['b', 'a']);
  });

  it('should drop a shown message the newest page no longer has when the page reaches back to it', () => {
    const shown = [
      message('c', 'me', at(12)),
      message('b', 'me', at(11)),
      message('a', 'me', at(10)),
    ];
    const page = [message('c', 'me', at(12)), message('a', 'me', at(10))];

    const merged = mergeNewestPage(
      { messages: page, complete: false, shownBefore: shownIds(shown) },
      shown,
      new Date(),
    );

    expect(ids(merged)).toEqual(['c', 'a']);
  });

  it('should drop the newest shown message when it was deleted while the page was not watched', () => {
    const shown = [message('b', 'them', at(11)), message('a', 'me', at(10))];
    const page = [message('a', 'me', at(10))];

    const merged = mergeNewestPage(
      { messages: page, complete: true, shownBefore: shownIds(shown) },
      shown,
      new Date(),
    );

    expect(ids(merged)).toEqual(['a']);
  });

  it('should keep older shown messages when the full newest page does not reach them', () => {
    const shown = [
      message('c', 'me', at(12)),
      message('b', 'me', at(11)),
      message('a', 'me', at(10)),
    ];
    const page = [message('c', 'me', at(12)), message('b', 'me', at(11))];

    const merged = mergeNewestPage(
      { messages: page, complete: false, shownBefore: shownIds(shown) },
      shown,
      new Date(),
    );

    expect(ids(merged)).toEqual(['c', 'b', 'a']);
  });

  it('should keep a message that arrived while the page was loading', () => {
    const before = [message('c', 'me', at(12))];
    const shown = [message('d', 'them', at(13)), ...before];

    const merged = mergeNewestPage(
      { messages: before, complete: true, shownBefore: shownIds(before) },
      shown,
      new Date(),
    );

    expect(ids(merged)).toEqual(['d', 'c']);
  });

  it('should drop everything shown before when the whole history comes back empty', () => {
    const shown = [message('a', 'me', at(10))];

    const merged = mergeNewestPage(
      { messages: [], complete: true, shownBefore: shownIds(shown) },
      shown,
      new Date(),
    );

    expect(merged).toEqual([]);
  });
});
