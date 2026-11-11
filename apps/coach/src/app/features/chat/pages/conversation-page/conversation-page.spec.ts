import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ErrorMessage } from '@core/feedback/error-message';
import { NotificationService } from '@core/feedback/notification.service';
import { LocaleStore } from '@core/i18n/locale.store';
import { FileUploadService } from '@shared/components/file-upload/file-upload.service';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { ChatComposerStore } from '../../chat-composer.store';
import { ChatDeletionStore } from '../../chat-deletion.store';
import { ChatOutboxStore } from '../../chat-outbox.store';
import { ChatPlaybackStore } from '../../chat-playback.store';
import { ConversationStore } from '../../conversation.store';
import { VoiceRecordingStore } from '../../voice-recording.store';
import { Message } from '../../models/chat';
import { ChatActivity } from '../../models/chat-activity';
import { Attachment, MessageKind } from '../../models/chat-attachment';
import { ChatService } from '../../services/chat.service';
import { PreviewUrls } from '../../services/preview-urls.service';
import { VoiceRecorder } from '../../services/voice-recorder.service';
import { ConversationPage } from './conversation-page';
import { MessageMenu } from './message-menu';

const VIP_ONLY = 'Chat is open only to athletes with an active VIP subscription.';
const NO_MESSAGES = 'No messages yet. Say hello!';
const UNSENT_LABEL = 'Unsent message';

const attachment = (fileId: string, change: Partial<Attachment> = {}): Attachment => ({
  fileId,
  url: `/api/files/${fileId}/content?expires=4102444800&signature=s`,
  fileName: 'plan.pdf',
  contentType: 'application/pdf',
  sizeBytes: 1258291,
  durationSeconds: null,
  width: null,
  height: null,
  waveform: [],
  ...change,
});
const message = (
  id: string,
  kind: MessageKind,
  attachments: readonly Attachment[],
  text = '',
): Message => ({
  id,
  conversationId: 'c1',
  senderUserId: 'them',
  kind,
  text,
  attachments,
  sentOn: new Date(2026, 10, 9, 9, 13),
});

function createFakeStore() {
  return {
    conversationId: signal<string | null>('c1'),
    name: signal('Aziz'),
    photoUrl: signal<string | null>(null),
    messages: signal<readonly Message[]>([]),
    canWrite: signal(true),
    activity: signal<ChatActivity | null>(null),
    online: signal(false),
    lastSeen: signal<Date | null>(null),
    otherUserId: signal('them'),
    otherReadUpTo: signal<Date | null>(null),
    loading: signal(false),
    loadError: signal<ErrorMessage | null>(null),
    loadingOlder: signal(false),
    maxLength: 2000,
    open: vi.fn().mockResolvedValue(undefined),
    show: vi.fn(),
    refused: vi.fn(),
    typed: vi.fn(),
    notifyActivity: vi.fn(),
    loadOlder: vi.fn(),
    mediaFailed: vi.fn(),
    openFile: vi.fn(),
  };
}

describe('ConversationPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  let store: ReturnType<typeof createFakeStore>;
  let fixture: ComponentFixture<ConversationPage>;
  const service = { send: vi.fn() };
  const deletion = { deleting: signal<ReadonlySet<string>>(new Set()), delete: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    Element.prototype.scrollTo = vi.fn();
    store = createFakeStore();
    deletion.deleting.set(new Set());
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ChatService, useValue: service },
        {
          provide: NotificationService,
          useValue: { error: vi.fn(), failure: vi.fn(), info: vi.fn() },
        },
        { provide: FileUploadService, useValue: { startUpload: vi.fn() } },
        { provide: PreviewUrls, useValue: { create: vi.fn(() => null), revoke: vi.fn() } },
        { provide: VoiceRecorder, useValue: { start: vi.fn() } },
      ],
    });
    TestBed.overrideComponent(ConversationPage, {
      set: {
        providers: [
          { provide: ConversationStore, useValue: store },
          ChatOutboxStore,
          VoiceRecordingStore,
          ChatComposerStore,
          ChatPlaybackStore,
          { provide: ChatDeletionStore, useValue: deletion },
          MessageMenu,
        ],
      },
    });
    TestBed.inject(LocaleStore).setLocale('en');
    fixture = TestBed.createComponent(ConversationPage);
    fixture.componentRef.setInput('userId', 'them');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function composer(): HTMLTextAreaElement | null {
    return page().querySelector('textarea');
  }

  async function type(text: string): Promise<void> {
    const input = composer();
    if (input === null) {
      throw new Error('The composer is not shown.');
    }
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function unsentBlock(): HTMLElement | null {
    return page().querySelector<HTMLElement>('.unsent');
  }

  async function refuseSendOf(text: string): Promise<void> {
    service.send.mockImplementation(() => {
      store.canWrite.set(false);
      return Promise.reject(new Error('VIP required'));
    });
    await type(text);
    await submit();
  }

  async function submit(): Promise<void> {
    page().querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should offer the composer and the invitation to write when the conversation is writable', () => {
    expect(composer()).not.toBeNull();
    expect(page().textContent).toContain(NO_MESSAGES);
    expect(page().querySelector('coach-note')).toBeNull();
  });

  it('should explain that chat is VIP only and hide the composer when the conversation is read-only', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()).toBeNull();
    expect(page().querySelector('coach-note')?.textContent).toContain(VIP_ONLY);
  });

  it('should not invite the coach to write when a read-only conversation has no history', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(page().textContent).not.toContain(NO_MESSAGES);
  });

  it('should restore the typed text when a send fails and the conversation stays writable', async () => {
    service.send.mockRejectedValue(new Error('offline'));
    await type('salom');

    await submit();

    expect(service.send).toHaveBeenCalledWith('c1', 'salom');
    expect(composer()?.value).toBe('salom');
  });

  it('should keep the typed text when a refused send turns the conversation read-only', async () => {
    service.send.mockImplementation(() => {
      store.canWrite.set(false);
      return Promise.reject(new Error('VIP required'));
    });
    await type('salom');

    await submit();
    expect(composer()).toBeNull();
    store.canWrite.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()?.value).toBe('salom');
  });

  it('should show the unsent text above the read-only note when a refused send turned the conversation read-only', async () => {
    await refuseSendOf('salom\nDo‘stim');

    const block = unsentBlock();
    const note = page().querySelector('coach-note');
    expect(block?.textContent).toContain(UNSENT_LABEL);
    expect(block?.querySelector('p')?.textContent).toBe('salom\nDo‘stim');
    expect(block?.compareDocumentPosition(note as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should not show an unsent block when the conversation is read-only and nothing was typed', async () => {
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(unsentBlock()).toBeNull();
    expect(page().textContent).not.toContain(UNSENT_LABEL);
  });

  it('should not show an unsent block when the typed text is only spaces', async () => {
    await type('   ');
    store.canWrite.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composer()).toBeNull();
    expect(unsentBlock()).toBeNull();
  });

  it('should not show an unsent block when the conversation is writable', async () => {
    await type('salom');

    expect(unsentBlock()).toBeNull();
    expect(page().textContent).not.toContain(UNSENT_LABEL);
  });

  it('should hide the unsent block and give the draft back to the composer when the conversation is writable again', async () => {
    await refuseSendOf('salom');
    store.canWrite.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(unsentBlock()).toBeNull();
    expect(composer()?.value).toBe('salom');
  });

  async function show(messages: readonly Message[]): Promise<void> {
    store.messages.set(messages);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should show an album with a tile per image and the caption under it', async () => {
    await show([
      message('m1', 'image', [attachment('a'), attachment('b'), attachment('c')], 'Leg day'),
    ]);

    expect(page().querySelectorAll('coach-image-album img')).toHaveLength(3);
    expect(page().querySelector('.caption')?.textContent).toContain('Leg day');
  });

  it('should open the gallery at the clicked image', async () => {
    await show([message('m1', 'image', [attachment('a'), attachment('b')])]);

    page().querySelectorAll<HTMLButtonElement>('coach-image-album button')[1].click();
    fixture.detectChanges();

    expect(page().querySelector('coach-image-gallery')?.textContent).toContain('2 of 2');
  });

  it('should show a file with its extension, name and size', async () => {
    await show([message('m1', 'file', [attachment('a')])]);

    const file = page().querySelector('coach-file-attachment');
    expect(file?.textContent).toContain('PDF');
    expect(file?.textContent).toContain('plan.pdf');
    expect(file?.textContent).toContain('1.2 MB');
  });

  it('should show a voice message with sixty four bars and its duration', async () => {
    await show([
      message('m1', 'voice', [attachment('a', { durationSeconds: 10, waveform: [10, 50, 90] })]),
    ]);

    expect(page().querySelectorAll('coach-voice-message .bar')).toHaveLength(64);
    expect(page().querySelector('coach-voice-message .clock')?.textContent).toContain('0:10');
  });

  it('should show a round video note with its duration', async () => {
    await show([message('m1', 'videoNote', [attachment('a', { durationSeconds: 24 })])]);

    expect(page().querySelector('coach-video-note video')).not.toBeNull();
    expect(page().querySelector('coach-video-note .clock')?.textContent).toContain('0:24');
  });

  it('should ask the store to refresh links when an image fails to load', async () => {
    await show([message('m1', 'image', [attachment('a')])]);

    page().querySelector('coach-image-album img')?.dispatchEvent(new Event('error'));

    expect(store.mediaFailed).toHaveBeenCalledWith('m1');
  });

  it('should show what the other side is doing in the header', async () => {
    store.activity.set('recordingVoice');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(page().querySelector('coach-app-bar')?.textContent).toContain(
      'recording a voice message',
    );
  });

  it('should offer the microphone until something is typed', async () => {
    expect(page().querySelector('[aria-label="Record a voice message"]')).not.toBeNull();

    await type('salom');
    fixture.detectChanges();

    expect(page().querySelector('[aria-label="Record a voice message"]')).toBeNull();
    expect(page().querySelector('button[type="submit"]')).not.toBeNull();
  });

  it('should scroll to the newest message when the coach sends one', async () => {
    service.send.mockResolvedValue(message('m9', 'text', [], 'salom'));
    await type('salom');
    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();

    await submit();

    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  async function rightClick(text: string): Promise<string[]> {
    const bubble = [...page().querySelectorAll('coach-message-bubble')].find((item) =>
      item.textContent?.includes(text),
    );
    bubble?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    return menuItems().map((item) => item.textContent?.trim() ?? '');
  }

  function menuItems(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>('.p-contextmenu-item-content')];
  }

  it('should offer copy and delete next to the pointer when the coach right clicks an own message', async () => {
    store.messages.set([{ ...message('m1', 'text', [], 'salom'), senderUserId: 'coach' }]);
    fixture.detectChanges();

    expect(await rightClick('salom')).toEqual(['Copy', 'Delete']);
  });

  it('should offer only copy when the coach right clicks a message of the athlete', async () => {
    store.messages.set([message('m1', 'text', [], 'salom')]);
    fixture.detectChanges();

    expect(await rightClick('salom')).toEqual(['Copy']);
  });

  it('should open no menu when the message has no action', async () => {
    store.messages.set([message('m1', 'voice', [attachment('f1')])]);
    fixture.detectChanges();
    const bubble = page().querySelector('coach-message-bubble');

    bubble?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(menuItems()).toEqual([]);
  });

  it('should delete the message only after the coach confirms it', async () => {
    store.messages.set([{ ...message('m1', 'text', [], 'salom'), senderUserId: 'coach' }]);
    fixture.detectChanges();
    await rightClick('salom');

    menuItems()[1].click();
    const sheets = TestBed.inject(Sheets);
    const confirm = sheets.request();
    expect(confirm?.kind === 'confirm' ? confirm.sheet.title : null).toBe('Delete this message?');
    expect(deletion.delete).not.toHaveBeenCalled();

    if (confirm?.kind === 'confirm') {
      confirm.resolve(true);
    }
    await fixture.whenStable();

    expect(deletion.delete).toHaveBeenCalledWith('m1');
  });

  it('should dim the message while it is being deleted', async () => {
    store.messages.set([{ ...message('m1', 'text', [], 'salom'), senderUserId: 'coach' }]);
    deletion.deleting.set(new Set(['m1']));
    fixture.detectChanges();

    expect(page().querySelector('.entry-body.is-deleting')).not.toBeNull();
  });
});
