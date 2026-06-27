import { InjectionToken } from '@angular/core';
import { Howler } from 'howler';

/**
 * Interface for Howler global methods used in the application
 * This provides type safety and allows mocking in tests
 */
export interface HowlerGlobal {
  /**
   * Get/set the global volume for all sounds
   * @param vol - Volume from 0.0 to 1.0 (optional, returns current volume if not provided)
   */
  volume(vol?: number): number | typeof Howler;
}

/**
 * Injection token for the Howler global object
 * Use this token to inject Howler global methods into services
 *
 * @example
 * ```typescript
 * // In a service
 * private howlerGlobal = inject(HOWLER_GLOBAL);
 *
 * // Set global volume
 * this.howlerGlobal.volume(0.5);
 * ```
 *
 * @example
 * ```typescript
 * // In tests, provide a mock
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: HOWLER_GLOBAL, useValue: { volume: jasmine.createSpy('volume') } }
 *   ]
 * });
 * ```
 */
export const HOWLER_GLOBAL = new InjectionToken<HowlerGlobal>('HowlerGlobal', {
  providedIn: 'root',
  factory: () => Howler,
});