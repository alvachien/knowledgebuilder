# Authentication / Login Workflow

The app uses OIDC (OpenID Connect) via [`angular-auth-oidc-client`](https://github.com/damienbod/angular-auth-oidc-client) with Authorization Code flow + PKCE. The ID server settings live in `src/environments/environment*.ts` and are gated by `loginRequired`.

## Login sequence

```mermaid
sequenceDiagram
    actor User
    participant SPA as Angular App
    participant Guard as AuthGuardService
    participant Auth as AuthService
    participant OIDC as OIDC Library
    participant IDP as Identity Server

    User->>SPA: Navigate to /vocabulary (protected)
    SPA->>Guard: canActivate()
    Guard->>Guard: environment.loginRequired?

    alt loginRequired = false
        Guard-->>SPA: return true → load route
    else loginRequired = true
        Guard->>Auth: authSubject.getValue().isAuthorized?
        alt Already authorized
            Guard-->>SPA: return true → load route
        else Not authorized
            Guard->>Auth: doLogin()
            Auth->>OIDC: authorize()
            OIDC-->>User: 302 → IDP login page
            User->>IDP: Enter credentials
            IDP-->>User: 302 → /signin-callback?code=...
            User->>SPA: Land on /signin-callback
            SPA->>OIDC: checkAuth()
            OIDC->>IDP: POST /token (exchange code)
            IDP-->>OIDC: id_token + access_token + refresh_token
            OIDC->>Auth: { isAuthenticated: true, userData, accessToken }
            Auth->>Auth: authSubject.next(UserAuthInfo)
            Auth-->>SPA: Redirect to originally requested route
            SPA->>SPA: Navbar shows user name + logout
        end
    end
```

## API call with Bearer token

```mermaid
sequenceDiagram
    participant Component
    participant HttpClient
    participant Interceptor as authInterceptor
    participant OIDC as OIDC Library
    participant API as Backend API

    Component->>HttpClient: GET apiUrl/api/TTS/details
    HttpClient->>Interceptor: intercept(req, next)
    Interceptor->>Interceptor: req.url startsWith environment.apiUrl?

    alt Matches apiUrl
        Interceptor->>OIDC: getAccessToken()
        OIDC-->>Interceptor: "eyJhbGci..."
        Interceptor->>Interceptor: Clone req with Authorization: Bearer <token>
        Interceptor->>API: Forward cloned request
        API-->>Interceptor: 200 OK
        Interceptor-->>HttpClient: Response
    else External URL (IDP, etc.)
        Interceptor->>API: Forward as-is (no token)
        API-->>Interceptor: Response
        Interceptor-->>HttpClient: Response
    end

    HttpClient-->>Component: Response
```

## Silent token refresh

```mermaid
sequenceDiagram
    participant OIDC as OIDC Library
    participant Auth as AuthService
    participant IDP as Identity Server

    Note over OIDC: access_token approaching expiry
    OIDC->>IDP: POST /token (grant=refresh_token)
    alt Refresh succeeds
        IDP-->>OIDC: New access_token + id_token
        OIDC->>Auth: EventTypes.NewAuthenticationResult
        Note over Auth: authSubject updated silently — no user prompt
    else Refresh fails
        IDP-->>OIDC: Error
        OIDC->>Auth: EventTypes.SilentRenewFailed
        Auth->>Auth: doLogin() → redirect to IDP
    end
```

## Logout

```mermaid
sequenceDiagram
    actor User
    participant Navbar
    participant Auth as AuthService
    participant OIDC as OIDC Library
    participant IDP as Identity Server

    User->>Navbar: Click logout
    Navbar->>Auth: doLogout()
    Auth->>OIDC: logoffAndRevokeTokens()
    OIDC->>IDP: Revoke tokens + end session
    IDP-->>OIDC: Confirmation
    OIDC-->>Auth: Complete
    Auth->>Auth: authSubject → cleanContent()
    Auth-->>User: Redirect to postLogoutRedirectUri (home)
```

## Key files

| File | Role |
|---|---|
| `src/app/services/auth.service.ts` | Wraps OIDC library, exposes `authSubject` / `authContent` |
| `src/app/services/auth.interceptor.ts` | Attaches `Bearer` to API-URL requests only |
| `src/app/services/auth-guard.service.ts` | Protects feature routes (`/vocabulary`, `/translating`, etc.) |
| `src/app/services/auth-check.util.ts` | Shared `checkAuthentication()` used by the guard |
| `src/app/interfaces/user-auth-info.ts` | `UserAuthInfo` model (isAuthorized, userName, accessToken, …) |
| `src/app/pages/signin-callback/` | Landing page after IDP redirect |
| `src/app/app.config.ts` | Calls `provideAuth({...})` + registers the interceptor |
| `src/app/app.routes.ts` | Wires `canActivate: [AuthGuardService]` on feature routes |
| `src/app/shared/navbar/` | Login / user-menu / logout UI |
| `src/environments/environment*.ts` | `loginRequired`, `idServerUrl`, `oidcClientId`, `oidcScope`, … |

## Configuration

`loginRequired` controls whether the guard actually blocks navigation:

| Env | `loginRequired` | Behaviour |
|---|---|---|
| `environment.ts` (dev) | `false` | All routes accessible — auth is wired but passive |
| `environment.prod.ts` | `true` | Feature routes require a valid session |

To activate login on dev, flip `loginRequired` to `true` and point `idServerUrl` / `oidcClientId` / `oidcScope` at a real identity server whose allowed redirect URIs include `${appHost}/signin-callback`.
