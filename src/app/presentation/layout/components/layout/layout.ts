import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../layout.service';
import { Footer } from '../footer/footer';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/** Authenticated application shell: topbar, sidebar and the routed page. */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Topbar, Sidebar, Footer],
  templateUrl: './layout.html',
})
export class Layout {
  private readonly layoutService = inject(LayoutService);

  protected readonly containerClass = computed(() => {
    const { menuMode } = this.layoutService.layoutConfig();
    const state = this.layoutService.layoutState();
    return {
      'layout-overlay': menuMode === 'overlay',
      'layout-static': menuMode === 'static',
      'layout-static-inactive': menuMode === 'static' && state.staticMenuDesktopInactive,
      'layout-overlay-active': state.overlayMenuActive,
      'layout-mobile-active': state.mobileMenuActive,
    };
  });
}
