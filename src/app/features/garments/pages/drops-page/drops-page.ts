import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { formatDate } from '@core/i18n/date-format';
import { LocaleStore } from '@core/i18n/locale.store';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { ProgressBar } from '@openng/optimus-ui/progressbar';
import { Tag } from '@openng/optimus-ui/tag';
import { DropFormDialog } from '../../components/drop-form-dialog/drop-form-dialog';
import { DropVariantFormDialog } from '../../components/drop-variant-form-dialog/drop-variant-form-dialog';
import { DropsStore } from '../../drops.store';
import { Drop } from '../../models/drop';
import { DropDraft, DropVariantDraft } from '../../models/drop-draft';

@Component({
  selector: 'app-drops-page',
  imports: [
    RouterLink,
    Button,
    Message,
    ProgressBar,
    Tag,
    DropFormDialog,
    DropVariantFormDialog,
    MessagePipe,
    TranslatePipe,
  ],
  providers: [DropsStore],
  templateUrl: './drops-page.html',
})
export class DropsPage {
  private readonly localeStore = inject(LocaleStore);

  protected readonly store = inject(DropsStore);
  protected readonly garmentsPath = AppPaths.garments;

  protected readonly dropFormVisible = signal(false);
  protected readonly variantFormVisible = signal(false);
  protected readonly variantDrop = signal<Drop | null>(null);

  constructor() {
    void this.store.load();
  }

  protected dateLabel(date: Date): string {
    return formatDate(date, this.localeStore.locale());
  }

  protected addDrop(): void {
    this.dropFormVisible.set(true);
  }

  protected async createDrop(draft: DropDraft): Promise<void> {
    if (await this.store.create(draft)) {
      this.dropFormVisible.set(false);
    }
  }

  protected addVariant(drop: Drop): void {
    this.variantDrop.set(drop);
    this.variantFormVisible.set(true);
  }

  protected async createVariant(draft: DropVariantDraft): Promise<void> {
    const drop = this.variantDrop();
    if (drop !== null && (await this.store.addVariant(drop, draft))) {
      this.variantFormVisible.set(false);
    }
  }
}
