import { TestBed } from '@angular/core/testing';
import { TransferState } from '@angular/core';
import { API_ORIGIN, API_ORIGIN_STATE, DEFAULT_API_ORIGIN } from './api-origin';
import { API_ORIGIN_ENV, serverApiOrigin } from './api-origin.server';

const STAGE_API = 'https://api.stage.peaktofan.com';

describe('API_ORIGIN', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use the production API when the server sent no origin', () => {
    expect(TestBed.inject(API_ORIGIN)).toBe(DEFAULT_API_ORIGIN);
  });

  it('should use the origin the server sent when the page was rendered elsewhere', () => {
    TestBed.inject(TransferState).set(API_ORIGIN_STATE, STAGE_API);

    expect(TestBed.inject(API_ORIGIN)).toBe(STAGE_API);
  });

  it('should take the server origin from the environment and hand it to the browser', () => {
    vi.stubEnv(API_ORIGIN_ENV, STAGE_API);

    const origin = TestBed.runInInjectionContext(serverApiOrigin);

    expect(origin).toBe(STAGE_API);
    expect(TestBed.inject(TransferState).get(API_ORIGIN_STATE, '')).toBe(STAGE_API);
  });

  it('should fall back to the production API when the environment has no origin', () => {
    vi.stubEnv(API_ORIGIN_ENV, '');

    expect(TestBed.runInInjectionContext(serverApiOrigin)).toBe(DEFAULT_API_ORIGIN);
  });
});
