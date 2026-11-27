import { Component, input } from '@angular/core';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DayMonthTimePipe, MoneyPipe } from '../format/format.pipes';
import { Payment } from './payment';

@Component({
  selector: 'coach-payment-row',
  imports: [TranslatePipe, MoneyPipe, DayMonthTimePipe],
  template: `
    @let paidOn = payment().paidOn;
    @let when = paidOn === null ? ('coachApp.common.unknown' | t) : (paidOn | dayMonthTime);
    <div class="text">
      @if (payment().name; as name) {
        <span class="t-base2 font-semibold coach-ellipsis">{{ name }}</span>
        <span class="t-base5 tone-secondary">{{ when }}</span>
      } @else {
        <span class="t-base3 font-medium">{{ when }}</span>
      }
      @if (payment().refunded) {
        <span class="c-tag c-tag--warning refund">{{ 'coachApp.payments.refunded' | t }}</span>
      }
    </div>
    <div class="sum">
      <span class="amount t-base2 font-semibold" [class.is-refunded]="payment().refunded">
        {{ payment().netAmount | money: currencyCode() }}
      </span>
      @if (payment().months > 1) {
        <span class="t-base5 tone-secondary">{{
          'coachApp.payments.months' | t: { months: payment().months }
        }}</span>
      }
    </div>
  `,
  styleUrl: './payment-row.css',
})
export class PaymentRow {
  readonly payment = input.required<Payment>();
  readonly currencyCode = input<string | null>(null);
}
