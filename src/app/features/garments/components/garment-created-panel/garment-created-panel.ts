import { Component, computed, inject, input, output } from '@angular/core';
import { CreatedGarment } from '../../models/created-garment';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Button } from '@openng/optimus-ui/button';
import { Tooltip } from '@openng/optimus-ui/tooltip';

@Component({
  selector: 'app-garment-created-panel',
  imports: [Button, Tooltip, TranslatePipe],
  templateUrl: './garment-created-panel.html',
})
export class GarmentCreatedPanel {
  private readonly clipboard = inject(ClipboardService);

  readonly garments = input.required<readonly CreatedGarment[]>();
  readonly exporting = input(false);

  readonly exportLinks = output<void>();

  protected readonly single = computed(() => {
    const garments = this.garments();
    return garments.length === 1 ? garments[0] : null;
  });
  protected readonly range = computed(() => {
    const editions = this.garments().map((garment) => garment.editionNumber);
    return {
      count: editions.length,
      first: Math.min(...editions),
      last: Math.max(...editions),
    };
  });

  protected copySerial(garment: CreatedGarment): Promise<void> {
    return this.clipboard.copy(garment.serialNumber, 'garments.fields.serialNumber');
  }

  protected copyLink(garment: CreatedGarment): Promise<void> {
    return this.clipboard.copy(garment.linkUrl, 'garments.fields.link');
  }

  protected copyToken(garment: CreatedGarment): Promise<void> {
    return this.clipboard.copy(garment.token, 'garments.fields.token');
  }
}
