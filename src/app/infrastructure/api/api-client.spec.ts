import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { ValidationError } from '@domain/shared/errors/validation.error';
import { ApiClient } from './api-client';
import { ApiProblem } from './api-problem';
import { Api } from './generated';

describe('ApiClient', () => {
  const fn = vi.fn();
  let invoke: ReturnType<typeof vi.fn>;
  let client: ApiClient;

  beforeEach(() => {
    invoke = vi.fn();
    TestBed.configureTestingModule({ providers: [{ provide: Api, useValue: { invoke } }] });
    client = TestBed.inject(ApiClient);
  });

  function problem(status: number, body: object): HttpErrorResponse {
    return new HttpErrorResponse({ status, error: body });
  }

  it('unwraps the result envelope', async () => {
    invoke.mockResolvedValue({ isSuccess: true, error: { code: '' }, data: { id: '1' } });

    await expect(client.send(fn, {})).resolves.toEqual({ id: '1' });
  });

  it('returns bodies without an envelope as they are', async () => {
    invoke.mockResolvedValue({ data: [], totalCount: 0 });

    await expect(client.send(fn, {})).resolves.toEqual({ data: [], totalCount: 0 });
  });

  it('turns a validation problem into a ValidationError with every message', async () => {
    invoke.mockRejectedValue(
      problem(400, {
        title: 'General.Validation',
        detail: 'One or more validation errors occurred',
        errors: [{ message: 'Name is required.' }, { message: 'Rows must be positive.' }],
      }),
    );

    await expect(client.send(fn, {})).rejects.toThrow(
      new ValidationError('Name is required.\nRows must be positive.'),
    );
  });

  it('maps shared statuses to domain errors', async () => {
    invoke.mockRejectedValueOnce(problem(404, { title: 'Exercise.NotFound', detail: 'Missing' }));
    await expect(client.send(fn, {})).rejects.toBeInstanceOf(NotFoundError);

    invoke.mockRejectedValueOnce(new HttpErrorResponse({ status: 403 }));
    await expect(client.send(fn, {})).rejects.toBeInstanceOf(AccessDeniedError);
  });

  it('lets the caller translate an endpoint-specific code first', async () => {
    invoke.mockRejectedValue(problem(400, { title: 'Authentication.InvalidCredentials' }));
    const translated = new Error('translated');

    await expect(
      client.send(
        fn,
        {},
        { translate: (p) => (p.code.startsWith('Authentication.') ? translated : null) },
      ),
    ).rejects.toBe(translated);
  });

  it('keeps unknown problems as ApiProblem and network failures untouched', async () => {
    invoke.mockRejectedValueOnce(problem(500, { title: 'Server failure' }));
    await expect(client.send(fn, {})).rejects.toBeInstanceOf(ApiProblem);

    const offline = new HttpErrorResponse({ status: 0 });
    invoke.mockRejectedValueOnce(offline);
    await expect(client.send(fn, {})).rejects.toBe(offline);
  });
});
