import { Component, computed, input, signal, viewChild } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { ContextMenu } from '@openng/optimus-ui/contextmenu';
import { Icon } from '@coach/core/ui/icon/icon';
import { SheetAction } from '@coach/core/ui/sheets/sheet-request';

@Component({
  selector: 'coach-message-context-menu',
  imports: [ContextMenu, Icon],
  templateUrl: './message-context-menu.html',
  styleUrl: './message-context-menu.css',
})
export class MessageContextMenu {
  readonly label = input.required<string>();

  private readonly menu = viewChild.required(ContextMenu);
  private readonly actions = signal<readonly SheetAction[]>([]);

  protected readonly items = computed<MenuItem[]>(() =>
    this.actions().map((action, index) => ({
      id: String(index),
      label: action.label,
      command: () => action.run(),
    })),
  );

  open(event: MouseEvent, actions: readonly SheetAction[]): void {
    if (actions.length === 0) {
      return;
    }
    this.actions.set(actions);
    this.menu().show(event);
  }

  protected actionOf(item: MenuItem): SheetAction | null {
    return this.actions()[Number(item.id)] ?? null;
  }
}
