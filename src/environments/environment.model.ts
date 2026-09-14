export interface Environment {
  readonly production: boolean;
  /** Backend root URL that the generated OpenAPI client calls. */
  readonly apiBaseUrl: string;
}
