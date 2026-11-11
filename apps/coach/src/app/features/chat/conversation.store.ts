import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { FileDownloadService } from '@core/feedback/file-download.service';
import { NotificationService } from '@core/feedback/notification.service';
import { ConversationTarget, locateConversation } from './conversation-locator';
import { ConversationPeer } from './conversation-peer';
import {
  MESSAGE_MAX_LENGTH,
  Message,
  PAGE_SIZE,
  mergeMessages,
  mergeNewestPage,
  withoutMessage,
} from './models/chat';
import { ChatActivity } from './models/chat-activity';
import { Attachment } from './models/chat-attachment';
import { isSubscriptionRequired } from './models/chat-access';
import { ChatHub } from './services/chat-hub.service';
import { MediaLinks } from './media-links';
import { ChatService } from './services/chat.service';

@Injectable()
export class ConversationStore {
  private readonly service = inject(ChatService);
  private readonly hub = inject(ChatHub);
  private readonly notifications = inject(NotificationService);
  private readonly downloads = inject(FileDownloadService);
  private readonly peer = new ConversationPeer();
  private readonly links = new MediaLinks(this.service, {
    conversationId: () => this.conversationId(),
    messages: () => this.messages(),
    replace: (messageId, fresh) => this.replaceMedia(messageId, fresh),
  });

  readonly conversationId = signal<string | null>(null);
  readonly otherUserId = this.peer.userId.asReadonly();
  readonly name = this.peer.name.asReadonly();
  readonly photoUrl = this.peer.photoUrl.asReadonly();
  readonly messages = signal<readonly Message[]>([]);
  readonly canWrite = signal(true);
  readonly otherReadUpTo = this.peer.readUpTo.asReadonly();
  readonly hasOlder = signal(false);
  readonly online = this.peer.online.asReadonly();
  readonly lastSeen = this.peer.lastSeen.asReadonly();
  readonly loading = signal(true);
  readonly loadError = signal<ErrorMessage | null>(null);
  readonly loadingOlder = signal(false);
  readonly maxLength = MESSAGE_MAX_LENGTH;

  readonly activity = this.peer.activity;
  readonly opened = computed(() => this.conversationId() !== null && !this.loading());

  constructor() {
    const destroyed = inject(DestroyRef);
    destroyed.onDestroy(() => this.peer.dispose());
    this.hub.messages
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((message) => this.received(message));
    this.hub.reads
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((read) => this.peer.read(read, this.conversationId()));
    this.hub.activities
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((notice) => this.peer.noticed(notice, this.conversationId()));
    this.hub.presence
      .pipe(takeUntilDestroyed(destroyed))
      .subscribe((presence) => this.peer.presence(presence));
    this.hub.reconnected.pipe(takeUntilDestroyed(destroyed)).subscribe(() => void this.reload());
    void this.hub.start();
  }

  async open(target: ConversationTarget): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    if (target.name !== undefined) {
      this.peer.name.set(target.name);
    }
    try {
      const located = await locateConversation(this.service, target);
      const id = located.id;
      this.peer.fill(located.found, target.userId);
      this.canWrite.set(located.canWrite ?? this.canWrite());
      const page = await this.service.messages(id, PAGE_SIZE);
      this.conversationId.set(id);
      this.messages.set(mergeMessages(page.messages, [], new Date()));
      this.peer.readUpTo.set(page.otherReadUpTo);
      this.hasOlder.set(page.messages.length >= PAGE_SIZE);
      void this.markRead();
    } catch (error) {
      this.failedToOpen(error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadOlder(): Promise<void> {
    const id = this.conversationId();
    const oldest = this.messages().at(-1);
    if (id === null || oldest === undefined || !this.hasOlder() || this.loadingOlder()) {
      return;
    }
    this.loadingOlder.set(true);
    try {
      const page = await this.service.messages(id, PAGE_SIZE, oldest.sentOn);
      this.show(page.messages);
      this.hasOlder.set(page.messages.length >= PAGE_SIZE);
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loadingOlder.set(false);
    }
  }

  show(messages: readonly Message[]): void {
    this.messages.update((shown) => mergeMessages(messages, shown, new Date()));
  }

  forget(messageId: string): void {
    this.messages.update((shown) => withoutMessage(shown, messageId));
  }

  refused(error: unknown): void {
    if (isSubscriptionRequired(error)) {
      this.canWrite.set(false);
    }
  }

  typed(): void {
    this.notifyActivity('typing');
  }

  notifyActivity(activity: ChatActivity): void {
    const id = this.conversationId();
    if (id !== null && this.canWrite()) {
      this.hub.activity(id, activity);
    }
  }

  mediaFailed(messageId: string): void {
    void this.links.refresh(messageId);
  }

  async openFile(messageId: string, attachment: Attachment): Promise<void> {
    const url = await this.links.freshUrl(messageId, attachment.fileId);
    if (url !== null) {
      this.downloads.open(url, attachment.fileName);
    }
  }

  private replaceMedia(messageId: string, fresh: readonly Message[]): void {
    this.messages.update((shown) =>
      mergeMessages(
        fresh,
        shown.map((message) =>
          message.id === messageId ? { ...message, attachments: [] } : message,
        ),
        new Date(),
      ),
    );
  }

  private failedToOpen(error: unknown): void {
    if (isSubscriptionRequired(error)) {
      this.canWrite.set(false);
      return;
    }
    this.loadError.set(toErrorMessage(error));
  }

  private received(message: Message): void {
    if (message.conversationId !== this.conversationId()) {
      return;
    }
    if (message.senderUserId === this.otherUserId()) {
      this.peer.clearActivity();
      void this.markRead();
    }
    this.show([message]);
  }

  private async reload(): Promise<void> {
    const id = this.conversationId();
    if (id === null) {
      return;
    }
    const shownBefore = new Set(this.messages().map((message) => message.id));
    try {
      const page = await this.service.messages(id, PAGE_SIZE);
      const complete = page.messages.length < PAGE_SIZE;
      this.messages.update((shown) =>
        mergeNewestPage({ messages: page.messages, complete, shownBefore }, shown, new Date()),
      );
      this.peer.readUpTo.set(page.otherReadUpTo ?? this.otherReadUpTo());
      void this.markRead();
    } catch {
      return;
    }
  }

  private async markRead(): Promise<void> {
    const id = this.conversationId();
    if (id === null) {
      return;
    }
    try {
      await this.service.markRead(id);
    } catch {
      return;
    }
  }
}
