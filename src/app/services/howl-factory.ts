import { InjectionToken } from '@angular/core';
import type { Howl, HowlOptions } from 'howler';
import { Howl as HowlClass } from 'howler';

/**
 * Factory function type for creating Howl instances
 * This allows the Howl constructor to be injected and mocked in tests
 */
export type HowlFactory = (options: HowlOptions) => Howl;

/**
 * Default factory implementation that creates real Howl instances
 */
export const defaultHowlFactory: HowlFactory = (options: HowlOptions): Howl => new HowlClass(options);

/**
 * Injection token for the Howl factory
 * Use this token to inject the factory into services that need to create Howl instances
 *
 * @example
 * ```typescript
 * // In a service
 * private howlFactory = inject(HOWL_FACTORY);
 *
 * // Create a Howl instance
 * const howl = this.howlFactory({ src: ['audio.mp3'] });
 * ```
 *
 * @example
 * ```typescript
 * // In tests, provide a mock factory
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: HOWL_FACTORY, useValue: mockHowlFactory }
 *   ]
 * });
 * ```
 */
export const HOWL_FACTORY = new InjectionToken<HowlFactory>('HowlFactory', {
  providedIn: 'root',
  factory: () => defaultHowlFactory,
});