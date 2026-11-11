import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/feedback/notification.service';
import { ConversationStore } from './conversation.store';
import { MessageDeletion } from './models/chat';
import { isAlreadyDeleted } from './models/chat-deletion';
import { ChatHub } from './services/chat-hub.service';
import { ChatService } from './services/chat.service';

@Injectable()
export class ChatDeletionStore {
  private readonly conversation = inject(ConversationStore);
  private readonly service = inject(ChatService);
  private readonly notifications = inject(NotificationService);
  private readonly inFlight = signal<ReadonlySet<string>>(new Set());

  readonly deleting = this.inFlight.asReadonly();

  constructor() {
    inject(ChatHub)
      .deletions.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((deletion) => this.deletedElsewhere(deletion));
  }

  async delete(messageId: string): Promise<void> {
    const conversationId = this.conversation.conversationId();
    if (conversationId === null || this.inFlight().has(messageId)) {
      return;
    }
    this.inFlight.update((ids) => new Set(ids).add(messageId));
    try {
      await this.service.delete(conversationId, messageId);
      this.conversation.forget(messageId);
    } catch (error) {
      this.failed(messageId, error);
    } finally {
      this.inFlight.update((ids) => new Set([...ids].filter((id) => id !== messageId)));
    }
  }

  private failed(messageId: string, error: unknown): void {
    if (isAlreadyDeleted(error)) {
      this.conversation.forget(messageId);
      return;
    }
    this.notifications.error(error);
  }

  private deletedElsewhere(deletion: MessageDeletion): void {
    if (deletion.conversationId === this.conversation.conversationId()) {
      this.conversation.forget(deletion.messageId);
    }
  }
}
