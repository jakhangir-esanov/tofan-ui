import { Component, computed, inject, input, signal } from '@angular/core';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { Button } from '@openng/optimus-ui/button';
import { Message } from '@openng/optimus-ui/message';
import { CatalogHeader } from '@shared/components/catalog-header/catalog-header';
import { CampaignCard } from '../../components/campaign-card/campaign-card';
import { CampaignFormDialog } from '../../components/campaign-form-dialog/campaign-form-dialog';
import { TimerForm } from '../../components/timer-form/timer-form';
import { DiscountsStore } from '../../discounts.store';
import { DISCOUNT_AUDIENCE_TEXTS, DiscountAudience } from '../../models/discount-audience';
import { DiscountCampaign } from '../../models/discount-campaign';
import { DiscountCampaignDraft } from '../../models/discount-campaign-draft';
import { DiscountTimerDraft } from '../../models/discount-timer-draft';

@Component({
  selector: 'app-discounts-page',
  imports: [
    Button,
    Message,
    CatalogHeader,
    CampaignCard,
    CampaignFormDialog,
    TimerForm,
    MessagePipe,
    TranslatePipe,
  ],
  providers: [DiscountsStore],
  templateUrl: './discounts-page.html',
})
export class DiscountsPage {
  private readonly confirmations = inject(ConfirmDialogService);
  private readonly translator = inject(Translator);

  protected readonly store = inject(DiscountsStore);

  readonly audience = input.required<DiscountAudience>();

  protected readonly texts = computed(() => DISCOUNT_AUDIENCE_TEXTS[this.audience()]);
  protected readonly editing = signal<DiscountCampaign | null>(null);
  protected readonly formVisible = signal(false);
  protected readonly formHeader = computed(() =>
    this.translator.translate(
      this.editing() === null ? 'discounts.form.createHeader' : 'discounts.form.editHeader',
    ),
  );

  constructor() {
    void this.store.load();
  }

  protected create(): void {
    this.editing.set(null);
    this.formVisible.set(true);
  }

  protected edit(campaign: DiscountCampaign): void {
    this.editing.set(campaign);
    this.formVisible.set(true);
  }

  protected async saveCampaign(draft: DiscountCampaignDraft): Promise<void> {
    const campaign = this.editing();
    const saved =
      campaign === null
        ? await this.store.createCampaign(draft)
        : await this.store.changeCampaign(campaign.id, draft);
    if (saved) {
      this.formVisible.set(false);
    }
  }

  protected async remove(campaign: DiscountCampaign): Promise<void> {
    const confirmed = await this.confirmations.confirm(
      { key: 'common.confirm.deleteQuestion', params: { subject: campaign.name } },
      'common.confirm.deleteHeader',
    );
    if (confirmed) {
      await this.store.removeCampaign(campaign);
    }
  }

  protected async saveTimer(draft: DiscountTimerDraft): Promise<void> {
    await this.store.saveTimer(draft);
  }
}
