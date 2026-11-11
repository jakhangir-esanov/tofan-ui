import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

export const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE_PX = 10;
const MOUSE = 'mouse';

@Directive({
  selector: '[coachMessagePress]',
  host: {
    '(contextmenu)': 'contextMenu($event)',
    '(pointerdown)': 'pressed($event)',
    '(pointermove)': 'moved($event)',
    '(pointerup)': 'released()',
    '(pointercancel)': 'released()',
  },
})
export class MessagePress {
  readonly menuRequested = output<MouseEvent>();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private start: PointerEvent | null = null;
  private held = false;
  private swallowNextClick = false;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const swallowClick = (event: MouseEvent): void => this.swallowClickAfterHold(event);
    element.addEventListener('click', swallowClick, { capture: true });
    inject(DestroyRef).onDestroy(() => {
      this.cancelTimer();
      element.removeEventListener('click', swallowClick, { capture: true });
    });
  }

  protected contextMenu(event: MouseEvent): void {
    event.preventDefault();
    if (this.held) {
      return;
    }
    this.cancelTimer();
    this.menuRequested.emit(event);
  }

  protected pressed(event: PointerEvent): void {
    this.cancelTimer();
    this.held = false;
    this.swallowNextClick = false;
    if (event.pointerType === MOUSE || !event.isPrimary) {
      return;
    }
    this.start = event;
    this.timer = setTimeout(() => this.heldLongEnough(event), LONG_PRESS_MS);
  }

  protected moved(event: PointerEvent): void {
    const start = this.start;
    if (start === null) {
      return;
    }
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE_PX) {
      this.cancelTimer();
    }
  }

  protected released(): void {
    this.cancelTimer();
    this.held = false;
  }

  private heldLongEnough(press: PointerEvent): void {
    this.cancelTimer();
    this.held = true;
    this.swallowNextClick = true;
    this.menuRequested.emit(press);
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = null;
    this.start = null;
  }

  private swallowClickAfterHold(event: MouseEvent): void {
    if (!this.swallowNextClick) {
      return;
    }
    this.swallowNextClick = false;
    event.preventDefault();
    event.stopPropagation();
  }
}
