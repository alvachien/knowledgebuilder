/**
 * One day of the caller's login history (POST echo / GET row of
 * aclearningutil's /api/UserLoginHistories).
 */
export interface UserLoginHistory {
  /** Server-local calendar day, 'yyyy-MM-dd'. */
  loginDate: string;
  /** ISO UTC instants; rendered browser-local by DatePipe. */
  firstLoginAt: string;
  lastLoginAt: string;
  loginCount: number;
}
