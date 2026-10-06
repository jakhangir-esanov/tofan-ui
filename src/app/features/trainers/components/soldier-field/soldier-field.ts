import { Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { AutoComplete } from '@openng/optimus-ui/autocomplete';
import { SoldierOption } from '../../models/soldier-option';

function isSoldierOption(candidate: unknown): candidate is SoldierOption {
  return typeof candidate === 'object' && candidate !== null && 'userId' in candidate;
}

@Component({
  selector: 'app-soldier-field',
  imports: [FormsModule, AutoComplete],
  templateUrl: './soldier-field.html',
})
export class SoldierField implements FormValueControl<string | null> {
  readonly value = model<string | null>(null);
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly touch = output<void>();

  readonly inputId = input<string>();
  readonly placeholder = input('');
  readonly emptyMessage = input('');
  readonly options = input.required<readonly SoldierOption[]>();

  readonly searchChange = output<string>();

  protected readonly entry = signal<SoldierOption | string | null>(null);

  protected change(entry: SoldierOption | string | null): void {
    this.entry.set(entry);
    this.value.set(isSoldierOption(entry) ? entry.userId : null);
  }

  protected search(query: string): void {
    this.searchChange.emit(query);
  }
}
