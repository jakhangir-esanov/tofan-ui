import {
  Component,
  afterRenderEffect,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Avatar } from '@coach/core/ui/avatar/avatar';
import { AppBar } from '@coach/core/ui/app-bar/app-bar';
import { EmptyState } from '@coach/core/ui/empty-state/empty-state';
import { Note } from '@coach/core/ui/note/note';
import { Spinner } from '@coach/core/ui/spinner/spinner';
import { formatTime } from '@coach/core/format/formats';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { ChatComposerStore } from '../../chat-composer.store';
import { ChatDeletionStore } from '../../chat-deletion.store';
import { ChatOutboxStore } from '../../chat-outbox.store';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { ChatComposer } from '../../components/chat-composer/chat-composer';
import { ImageGallery } from '../../components/image-gallery/image-gallery';
import { MessageBubble } from '../../components/message-bubble/message-bubble';
import { MessageContextMenu } from '../../components/message-context-menu/message-context-menu';
import { MessagePress } from '../../components/message-press/message-press';
import { PendingBubble } from '../../components/pending-bubble/pending-bubble';
import { ConversationStore } from '../../conversation.store';
import { Message, chatInitials, isMine, isRead, opensDay } from '../../models/chat';
import { canDelete } from '../../models/chat-deletion';
import { dayLabel, presenceText } from '../../models/chat-text';
import { VoiceRecordingStore } from '../../voice-recording.store';
import { MessageMenu } from './message-menu';

const OLDER_THRESHOLD_PX = 240;
const NEWEST_SCROLL_TOP = 0;

interface GalleryTarget {
  readonly messageId: string;
  readonly index: number;
}

@Component({
  selector: 'coach-conversation-page',
  imports: [
    TranslatePipe,
    MessagePipe,
    AppBar,
    Avatar,
    EmptyState,
    Note,
    Spinner,
    ChatComposer,
    ImageGallery,
    MessageBubble,
    MessageContextMenu,
    MessagePress,
    PendingBubble,
  ],
  providers: [
    ConversationStore,
    ChatOutboxStore,
    VoiceRecordingStore,
    ChatComposerStore,
    ChatPlaybackStore,
    ChatDeletionStore,
    MessageMenu,
  ],
  templateUrl: './conversation-page.html',
  styleUrl: './conversation-page.css',
})
export class ConversationPage {
  protected readonly store = inject(ConversationStore);
  protected readonly outbox = inject(ChatOutboxStore);
  protected readonly composer = inject(ChatComposerStore);
  protected readonly deletion = inject(ChatDeletionStore);
  private readonly menu = inject(MessageMenu);
  private readonly translator = inject(Translator);
  private readonly locale = inject(LocaleStore).locale;

  readonly userId = input<string | undefined>(undefined);
  readonly conversationId = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly contextMenu = viewChild.required(MessageContextMenu);
  private readonly galleryTarget = signal<GalleryTarget | null>(null);

  protected readonly title = computed(() => this.store.name() || this.name() || '');
  protected readonly presence = computed(() =>
    presenceText(
      {
        activity: this.store.activity(),
        online: this.store.online(),
        lastSeen: this.store.lastSeen(),
      },
      new Date(),
      this.locale(),
      this.translator.translate.bind(this.translator),
    ),
  );
  protected readonly live = computed(() => this.store.activity() !== null || this.store.online());
  protected readonly initials = computed(() => chatInitials(this.title()));
  protected readonly rows = computed(() => {
    const messages = this.store.messages();
    const other = this.store.otherUserId();
    const now = new Date();
    const t = this.translator.translate.bind(this.translator);
    return messages.map((message, index) => ({
      message,
      mine: isMine(message, other),
      read: isMine(message, other) && isRead(message, this.store.otherReadUpTo()),
      deletable: canDelete(message, other),
      time: formatTime(message.sentOn),
      day: opensDay(messages, index) ? dayLabel(message.sentOn, now, this.locale(), t) : null,
    }));
  });
  protected readonly pendingNewestFirst = computed(() => [...this.outbox.pending()].reverse());
  protected readonly gallery = computed(() => {
    const target = this.galleryTarget();
    const row = this.rows().find((item) => item.message.id === target?.messageId);
    if (target === null || row === undefined) {
      return null;
    }
    return {
      ...target,
      message: row.message,
      title: row.mine ? this.translator.translate('coachApp.chat.you') : this.title(),
      subtitle: `${row.day ?? ''} ${row.time}`.trim(),
    };
  });

  constructor() {
    effect(() => {
      const target = {
        userId: this.userId(),
        conversationId: this.conversationId(),
        name: this.name(),
      };
      untracked(() => void this.store.open(target));
    });
    afterRenderEffect(() => {
      if (this.outbox.outgoingRevision() > 0) {
        untracked(() => this.scrollToNewest());
      }
    });
  }

  private scrollToNewest(): void {
    this.scroller()?.nativeElement.scrollTo({ top: NEWEST_SCROLL_TOP, behavior: 'smooth' });
  }

  protected scrolled(): void {
    const element = this.scroller()?.nativeElement;
    if (element === undefined) {
      return;
    }
    const remaining = element.scrollHeight + element.scrollTop - element.clientHeight;
    if (remaining < OLDER_THRESHOLD_PX) {
      void this.store.loadOlder();
    }
  }

  protected openImage(message: Message, index: number): void {
    this.galleryTarget.set({ messageId: message.id, index });
  }

  protected openMenu(event: MouseEvent, message: Message, deletable: boolean): void {
    this.contextMenu().open(event, this.menu.actionsFor(message, deletable));
  }

  protected closeGallery(): void {
    this.galleryTarget.set(null);
  }
}
