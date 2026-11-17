import { toActivityNotice, toConversation, toMessage, toMessageDeletion } from './chat.mapper';
import { ConversationResponse, MessageResponse } from './chat.dto';

const apiUrl = (path: string) => `/api${path}`;
const futureValue = Number('9');

const voiceResponse: MessageResponse = {
  id: 'm1',
  conversationId: 'c1',
  senderUserId: 'them',
  kind: 4,
  text: '',
  sentOnUtc: '2026-11-08T18:20:11.5Z',
  attachments: [
    {
      fileId: 'f1',
      url: '/files/f1/content?expires=1794164400&signature=abc',
      fileName: 'voice.m4a',
      contentType: 'audio/mp4',
      sizeBytes: 83215,
      durationSeconds: 10,
      width: null,
      height: null,
      waveform: [0, 12, 40],
    },
  ],
};

const conversationResponse: ConversationResponse = {
  id: 'c1',
  otherUserId: 'them',
  otherUserName: ' Aziz ',
  otherUserPhotoUrl: null,
  otherIsOnline: false,
  otherLastSeenOnUtc: null,
  otherReadUpToUtc: null,
  lastMessageSenderUserId: 'them',
  lastMessageKind: 2,
  lastMessageText: '',
  lastMessageOnUtc: '2026-11-08T18:20:11Z',
  unreadCount: 1,
  canWrite: true,
};

describe('chat mapper', () => {
  it('should map the kind and the attachments with an absolute signed url', () => {
    const message = toMessage(voiceResponse, apiUrl);

    expect(message.kind).toBe('voice');
    expect(message.text).toBe('');
    expect(message.attachments[0]).toEqual({
      fileId: 'f1',
      url: '/api/files/f1/content?expires=1794164400&signature=abc',
      fileName: 'voice.m4a',
      contentType: 'audio/mp4',
      sizeBytes: 83215,
      durationSeconds: 10,
      width: null,
      height: null,
      waveform: [0, 12, 40],
    });
  });

  it('should read a v1 message as text without attachments', () => {
    const message = toMessage(
      { ...voiceResponse, kind: undefined, attachments: undefined, text: null },
      apiUrl,
    );

    expect(message.kind).toBe('text');
    expect(message.text).toBe('');
    expect(message.attachments).toEqual([]);
  });

  it('should show an unknown future kind as text', () => {
    expect(toMessage({ ...voiceResponse, kind: futureValue }, apiUrl).kind).toBe('text');
  });

  it('should map the last message kind of a conversation', () => {
    expect(toConversation(conversationResponse, apiUrl).lastMessageKind).toBe('image');
    expect(
      toConversation({ ...conversationResponse, lastMessageKind: null }, apiUrl).lastMessageKind,
    ).toBeNull();
  });

  it('should map a known activity and drop an unknown one', () => {
    expect(toActivityNotice({ conversationId: 'c1', userId: 'them', activity: 2 })).toEqual({
      conversationId: 'c1',
      userId: 'them',
      activity: 'recordingVoice',
    });
    expect(
      toActivityNotice({ conversationId: 'c1', userId: 'them', activity: futureValue }),
    ).toBeNull();
    expect(toActivityNotice({ userId: 'them', activity: 1 })).toBeNull();
  });
});

describe('toMessageDeletion', () => {
  it('should take the conversation and the message when a deletion event arrives', () => {
    expect(
      toMessageDeletion({
        conversationId: 'c1',
        messageId: 'm1',
        lastMessageSenderUserId: null,
        lastMessageKind: null,
        lastMessageText: '',
        lastMessageOnUtc: null,
      }),
    ).toEqual({ conversationId: 'c1', messageId: 'm1' });
  });

  it('should ignore a deletion event without its ids', () => {
    expect(toMessageDeletion({ conversationId: 'c1' })).toBeNull();
    expect(toMessageDeletion({ messageId: 'm1' })).toBeNull();
  });
});
