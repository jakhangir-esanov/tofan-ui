import { Injectable, inject } from '@angular/core';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { TranslationKey } from '@core/i18n/dictionary';
import { Translator } from '@core/i18n/translator';
import { SheetAction } from '@coach/core/ui/sheets/sheet-request';
import { Sheets } from '@coach/core/ui/sheets/sheets.service';
import { ChatDeletionStore } from '../../chat-deletion.store';
import { Message } from '../../models/chat';

@Injectable()
export class MessageMenu {
  private readonly sheets = inject(Sheets);
  private readonly translator = inject(Translator);
  private readonly clipboard = inject(ClipboardService);
  private readonly deletion = inject(ChatDeletionStore);

  actionsFor(message: Message, deletable: boolean): SheetAction[] {
    const actions: SheetAction[] = [];
    if (message.text !== '') {
      actions.push({
        label: this.t('coachApp.conversation.copy'),
        icon: 'copy',
        run: () => void this.clipboard.copy(message.text, 'coachApp.conversation.copySubject'),
      });
    }
    if (deletable) {
      actions.push({
        label: this.t('coachApp.conversation.delete'),
        icon: 'trash',
        destructive: true,
        run: () => void this.confirmDelete(message.id),
      });
    }
    return actions;
  }

  private async confirmDelete(messageId: string): Promise<void> {
    const confirmed = await this.sheets.confirm({
      title: this.t('coachApp.conversation.deleteTitle'),
      message: this.t('coachApp.conversation.deleteMessage'),
      confirmLabel: this.t('coachApp.conversation.delete'),
      cancelLabel: this.t('coachApp.common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      await this.deletion.delete(messageId);
    }
  }

  private t(key: TranslationKey): string {
    return this.translator.translate(key);
  }
}
