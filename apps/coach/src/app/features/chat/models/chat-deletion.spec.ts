import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { Message } from './chat';
import { canDelete, isAlreadyDeleted } from './chat-deletion';

const message = (senderUserId: string): Message => ({
  id: 'm1',
  conversationId: 'c1',
  senderUserId,
  kind: 'text',
  text: 'salom',
  attachments: [],
  sentOn: new Date('2026-11-10T09:00:00Z'),
});

describe('canDelete', () => {
  it('should allow deleting when the coach sent the message', () => {
    expect(canDelete(message('coach'), 'athlete')).toBe(true);
  });

  it('should refuse deleting when the other side sent the message', () => {
    expect(canDelete(message('athlete'), 'athlete')).toBe(false);
  });

  it('should refuse deleting when the other side is not known yet', () => {
    expect(canDelete(message('coach'), '')).toBe(false);
  });
});

describe('isAlreadyDeleted', () => {
  it('should be true when the backend no longer finds the message', () => {
    expect(isAlreadyDeleted(new NotFoundError('gone', 'Chat.MessageNotFound'))).toBe(true);
  });

  it('should be false when the conversation itself is missing or the failure is another kind', () => {
    expect(isAlreadyDeleted(new NotFoundError('gone', 'Chat.ConversationNotFound'))).toBe(false);
    expect(isAlreadyDeleted(new BusinessRuleError('no', 'Chat.MessageNotFound'))).toBe(false);
    expect(isAlreadyDeleted(new Error('Chat.MessageNotFound'))).toBe(false);
  });
});
