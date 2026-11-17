import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { UsageRow } from '../../models/usage';

const PERCENT = 100;

@Component({
  selector: 'app-usage-list',
  imports: [TranslatePipe],
  templateUrl: './usage-list.html',
})
export class UsageList {
  readonly rows = input.required<readonly UsageRow[]>();

  private readonly largestShare = computed(() =>
    Math.max(0, ...this.rows().map((row) => row.share)),
  );

  protected widthOf(row: UsageRow): number {
    const largest = this.largestShare();
    return largest === 0 ? 0 : (row.share / largest) * PERCENT;
  }
}
