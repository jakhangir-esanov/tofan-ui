import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { NotificationService } from '@core/feedback/notification.service';
import { NotFoundError } from '@shared/models/errors/not-found.error';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { ChatDeletionStore } from './chat-deletion.store';
import { ConversationStore } from './conversation.store';
import { MessageDeletion } from './models/chat';
import { ChatHub } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

function createConversation() {
  return { conversationId: signal<string | null>('c1'), forget: vi.fn() };
}

describe('ChatDeletionStore', () => {
  const service = { delete: vi.fn() };
  const notifications = { error: vi.fn() };
  const hub = { deletions: new Subject<MessageDeletion>() };
  let conversation: ReturnType<typeof createConversation>;
  let store: ChatDeletionStore;

  beforeEach(() => {
    vi.resetAllMocks();
    conversation = createConversation();
    TestBed.configureTestingModule({
      providers: [
        ChatDeletionStore,
        { provide: ConversationStore, useValue: conversation },
        { provide: ChatService, useValue: service },
        { provide: ChatHub, useValue: hub },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    store = TestBed.inject(ChatDeletionStore);
  });

  it('should delete on the backend and then forget the message when the coach deletes it', async () => {
    service.delete.mockResolvedValue(undefined);

    await store.delete('m1');

    expect(service.delete).toHaveBeenCalledWith('c1', 'm1');
    expect(conversation.forget).toHaveBeenCalledWith('m1');
    expect(store.deleting().size).toBe(0);
  });

  it('should mark the message as being deleted and ignore a second request meanwhile', async () => {
    let finish: () => void = () => undefined;
    service.delete.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));

    const first = store.delete('m1');
    expect(store.deleting().has('m1')).toBe(true);
    await store.delete('m1');
    finish();
    await first;

    expect(service.delete).toHaveBeenCalledTimes(1);
    expect(store.deleting().has('m1')).toBe(false);
  });

  it('should forget the message quietly when the backend says it is already gone', async () => {
    service.delete.mockRejectedValue(new NotFoundError('gone', 'Chat.MessageNotFound'));

    await store.delete('m1');

    expect(conversation.forget).toHaveBeenCalledWith('m1');
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('should keep the message and show the error when deleting fails for another reason', async () => {
    const failure = new ServiceUnavailableError();
    service.delete.mockRejectedValue(failure);

    await store.delete('m1');

    expect(conversation.forget).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(failure);
  });

  it('should do nothing when no conversation is open', async () => {
    conversation.conversationId.set(null);

    await store.delete('m1');

    expect(service.delete).not.toHaveBeenCalled();
  });

  it('should forget a message deleted elsewhere only when it belongs to this conversation', () => {
    hub.deletions.next({ conversationId: 'other', messageId: 'x' });
    hub.deletions.next({ conversationId: 'c1', messageId: 'm2' });

    expect(conversation.forget).toHaveBeenCalledTimes(1);
    expect(conversation.forget).toHaveBeenCalledWith('m2');
  });
});
