# FanFicBinder Security Audit

**Assessment date:** October 23, 2026  
**Scope:** React/Vite client, Express server, Netlify deployment and function, URL import pipeline, generated EPUB/HTML, dependencies, authentication/CORS, and repository secret exposure.

## Executive summary

The audit found two urgent proxy flaws: attacker-controlled pages were returned as executable HTML under FanFicBinder's origin, and DNS validation was not bound to the address used for the outbound connection. Those flaws could enable same-origin script execution and DNS-rebinding SSRF into private networks or cloud metadata services. Both are remediated.

The public import feature remains anonymous by design. It now permits only GET requests from same-origin browser contexts, restricts destinations to public HTTP(S) addresses on ports 80/443, pins each validated DNS answer to its connection, revalidates every redirect, applies response and time limits, and is rate-limited. This preserves importing from arbitrary public fanfiction sites without adding accounts or a domain allowlist.

Runtime dependency audit is clean after non-breaking updates plus a reviewed Drizzle ORM update. Four moderate development-only advisories remain through Drizzle Kit's obsolete esbuild loader; npm offers only a breaking downgrade as its automated remediation.

## Findings and remediation

### FFB-001 — Critical — Same-origin proxy XSS (fixed)

- **Location:** `functions/proxy.js` (previous response at lines 195-204); duplicate Express route in `server/routes.ts`.
- **Evidence:** The proxy returned arbitrary upstream bytes as `Content-Type: text/html` with wildcard CORS. A crafted `/api/proxy?url=...` navigation could therefore execute an attacker page under FanFicBinder's origin and access same-origin browser storage.
- **Fix:** Proxy success responses are now `text/plain; charset=utf-8` with `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, and `Cache-Control: no-store` (`functions/proxy.js:3-38`; `server/routes.ts`). Wildcard CORS and preflight support were removed.
- **Regression coverage:** `tests/targeted.test.ts:78` verifies that a body containing `<script>` remains readable by the importer but is served only as plain text, without an ACAO header.

### FFB-002 — High — DNS-rebinding SSRF / DNS-to-connection mismatch (fixed)

- **Location:** Previous `functions/proxy.js:63-129` and `server/routes.ts` duplicate.
- **Evidence:** The code validated `dns.lookup()` results and then let Axios perform a second lookup when opening the socket. An attacker controlling DNS could return a public address during validation and a private address during connection.
- **Fix:** URL validation and fetching are centralized in `shared/proxy-fetch.ts`. Every hop resolves once, rejects the entire answer set if any address is non-public, and supplies a per-request HTTP(S) agent whose lookup callback returns only the selected validated address (`shared/proxy-fetch.ts:82-149,156-190`). Hostname/SNI certificate validation is retained. Axios environment proxies are disabled for this request path so they cannot bypass address pinning.
- **Redirects:** Automatic redirects remain disabled. Each `Location` is resolved relative to the current URL, fully revalidated, and separately pinned; the existing five-redirect limit remains.
- **Regression coverage:** Tests cover mixed public/private DNS answers and verify that the socket lookup receives only the pinned public address.

### FFB-003 — High — Private/special IP and cloud metadata access gaps (fixed)

- **Location:** Previous `functions/proxy.js:23-61` and server duplicate.
- **Evidence:** IPv6 link-local validation matched only `fe80:` rather than `fe80::/10`; direct bracketed IPv6 literals were not normalized before `net.isIP`. Hand-maintained checks omitted other special-use ranges.
- **Fix:** CIDR-aware `net.BlockList` rules now cover private, loopback, link-local, carrier-grade NAT, benchmarking, documentation, multicast, reserved, IPv4-mapped IPv6, NAT64, transition, and unique-local ranges (`shared/proxy-fetch.ts:20-62`). URL credentials and nonstandard ports are rejected. This blocks common metadata addresses including `169.254.169.254`, `100.100.100.200`, private DNS answers, and IPv6 local ranges.
- **Regression coverage:** Tests include loopback/private/metadata IPv4, IPv4-mapped IPv6, broader IPv6 link-local, and public IPv4/IPv6 controls.

### FFB-004 — High — Anonymous open-proxy abuse (substantially mitigated)

- **Location:** Previous `functions/proxy.js:173-204`; `netlify.toml` had no rate limit.
- **Evidence:** Any method and any web origin could invoke a public arbitrary-host fetcher. No authentication, origin control, destination-port policy, or rate limit was present.
- **Fix:** Only GET is accepted; explicit cross-site `Origin` and `Sec-Fetch-Site` requests are rejected; CORS is disabled; URL userinfo and ports other than 80/443 are rejected. Netlify's function config maps only `/api/proxy` (removing the default function alias) and limits each IP/domain to 30 requests per 60 seconds (`functions/proxy.js:9-54`). The standalone Express server applies the same fixed-window per-client limit with bounded memory (`server/routes.ts`).
- **Authentication decision:** Accounts were not added. The application has no protected server-side user data or privileged API, and anonymous arbitrary-public-site importing is its core workflow. Authentication would be a product/architecture change rather than a minimal security fix.
- **Residual risk:** Distributed clients can still consume outbound bandwidth within per-IP limits. Netlify notes that enforcement can lag by up to ten seconds. See Remaining risks.

### FFB-005 — Medium — Content type, size, and timeout policy too broad/incomplete (fixed)

- **Location:** Previous `functions/proxy.js:99-107,114-167`.
- **Evidence:** Every `text/*` media type was accepted, and the 10-second socket timeout renewed at each redirect. DNS had no explicit deadline.
- **Fix:** Only `text/html`, `application/xhtml+xml`, and `text/plain` are accepted. Responses remain capped at 5 MiB by Axios while streaming/decompressing and are byte-checked again before return. DNS has a 2-second bound, each request has a 10-second bound, and the complete redirect chain has a 20-second wall-clock budget (`shared/proxy-fetch.ts:7-10,64-80,151-203`).

### FFB-006 — Medium — Exported-content sanitizer bypasses (fixed)

- **Location:** Previous `client/src/lib/content/sanitize.ts:3-63`; sinks at `client/src/lib/exporters/readerHtml.ts:12,90` and `client/src/lib/exporters/epub.ts:41`.
- **Evidence:** The blocklist sanitizer allowed active/structural elements and accepted URL attributes based on a simple prefix check. Browser-normalized variants such as a tab-obfuscated `javascript:` URL could survive into downloaded Reader HTML or EPUB content. The no-DOM/error fallback used incomplete regular expressions.
- **Fix:** Sanitization now uses an explicit fiction-formatting element and attribute allowlist, removes active document/SVG/MathML/form elements, strips event/style/namespace attributes, and permits only explicit safe link and raster-image URL forms (`client/src/lib/content/sanitize.ts:3-83`). Parser failure or absence escapes all input as plain text instead of attempting regex sanitization.
- **App-origin assessment:** No `dangerouslySetInnerHTML`, `srcdoc`, or equivalent live React sink consumes chapter bodies. Imported markup is stored locally and sanitized only when exported. FFB-001 was the direct app-origin execution path.

### FFB-007 — High — Known dependency vulnerabilities (runtime fixed; development residual)

- **Evidence before remediation:** `npm audit` reported 23 advisories (1 critical, 13 high, 8 moderate, 1 low); `npm audit --omit=dev` reported 10 runtime advisories (1 critical, 6 high, 3 moderate). Affected direct/runtime paths included Axios, Express, ws, Drizzle ORM, and proxy-addr.
- **Fix:** `npm audit fix` updated packages allowed by existing ranges; Drizzle ORM was deliberately raised to `^0.45.4` to fix its SQL-identifier injection advisory. Locked key versions now include Axios 1.20.0, Express 4.22.3, ws 8.22.0, Drizzle ORM 0.45.4, Vite 7.3.7, and esbuild 0.25.9.
- **Result:** `npm audit --omit=dev` reports **0 vulnerabilities**. Full `npm audit` reports four moderate development-only findings inherited from Drizzle Kit -> `@esbuild-kit/esm-loader` -> esbuild 0.18.20. The affected behavior concerns an exposed development server; Vite host validation has also been restored by removing `allowedHosts: true`.

### FFB-008 — Medium/Low — Deployment and server hardening gaps (fixed)

- **Headers:** Netlify static responses now set framing protection, MIME sniffing protection, a referrer policy, a restricted permissions policy, and a minimal CSP (`netlify.toml:11-19`). The proxy sets stronger per-response CSP because Netlify static header rules do not apply to function responses.
- **Express:** `X-Powered-By` is disabled, baseline headers and 100 KiB/100-parameter parser limits were added, and unexpected 5xx error details are no longer returned to clients (`server/app.ts:18-40,76-81`).
- **Development server:** Unrestricted Vite host acceptance was removed from both Vite configurations.
- **CSP scope:** The static CSP intentionally restricts high-risk document capabilities without imposing `script-src`; a strict script allowlist would need coordinated testing of Google Analytics, AdSense, Fonts, and generated Vite chunks.

### FFB-009 — Low — Secret-file prevention gap (fixed; no exposure found)

- **Evidence:** No tracked or present `.env`, private key, token, credential file, or hard-coded secret was found. Google Analytics and AdSense identifiers in `client/index.html` are public identifiers. `drizzle.config.ts` expects `DATABASE_URL`, but `.gitignore` did not ignore environment files.
- **Fix:** `.env` and `.env.*` are ignored while `.env.example` remains eligible for version control.
- **Authentication note:** `shared/schema.ts` contains an unused plaintext `password` column. No authentication route or database consumer exists. If authentication is introduced later, replace it with a password-hash field and a reviewed password hashing/session design before use.

## Verification

- `npm run check` — passed.
- `npm run build` — passed, including client build, SSR/prerender generation, and production Express bundle.
- `npm run test:targeted` — passed.
- Netlify proxy function standalone esbuild bundle — passed (510.8 KiB test bundle, then removed).
- `git diff --check` — passed.
- `npm audit --omit=dev` — 0 vulnerabilities.
- `npm audit` — 4 moderate development-only vulnerabilities through Drizzle Kit's legacy esbuild loader.

No deployment, push, commit, or remote-state change was performed.

## Remaining risks and operational follow-up

1. **Anonymous distributed abuse:** Per-IP edge limits do not impose a global budget on non-Enterprise Netlify plans. Monitor function invocations, bandwidth, error rate, and destination patterns; apply a Netlify UI/WAF global rule if the deployed plan supports it. If abuse becomes material, a user/session quota or narrow source-domain policy is the next product-level control.
2. **Validate edge configuration on the next authorized deploy:** Netlify documents that invalid code-based rate-limit rules may not fail a deploy. Check the deploy post-processing log for the `/api/proxy` rule and verify that `/.netlify/functions/proxy` is no longer reachable. No deploy was authorized during this audit.
3. **Development-only advisories:** Track Drizzle Kit for removal of `@esbuild-kit/esm-loader`. Do not expose the Drizzle development tooling to untrusted networks. Avoid npm's proposed forced downgrade to Drizzle Kit 0.18.1 without a separate compatibility review.
4. **No network egress firewall:** Application controls are now fail-closed and socket-pinned, but a platform egress policy denying private/link-local ranges would provide independent defense in depth if Netlify offers it for this project.
5. **Third-party scripts:** Google Analytics and AdSense retain their normal third-party script supply-chain/privacy exposure. A strict `script-src` CSP was not imposed because doing so without nonce/hash and ad-flow testing could break production functionality.
6. **Live environment not exercised:** Local tests and bundles passed, but production headers, rate-limit activation, DNS behavior, and runtime egress can only be confirmed after an authorized deploy.
