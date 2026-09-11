// Error analyzer: pattern → { what, why, fix }. No LLM, no deps.
// Matched against normalized message text from the collector. First match wins,
// so order rules most-specific first. Fallback = generic guidance by keyword.
// ponytail: static rule table; move to a JSON file if it grows past ~40 rules.
window.ErrorAnalyzer = (function () {
  // Each rule: { re, what, why, fix }. `re` tested against (service + " " + message).
  const RULES = [];
  const add = (re, what, why, fix) => RULES.push({ re, what, why, fix });

  // People/team lookup failures — common API-gateway and service-side NOT_FOUNDs.
  add(/teammember not found|team not found|account channel not found|channel with id <n> not found/, "Lookup target missing.", "The request references a user/team/channel that no longer exists or was never created.", "Check the ID mapping and tenant scope; return 404 and avoid retrying the same bad reference.");

  // Webhook / gRPC / RabbitMQ path failures.
  add(/webhook .*failed after 3 attempts|precondition_failed|unknown delivery tag|not found for this conversation|csat not found/, "Downstream workflow failure.", "A webhook, queue ack, or gRPC call failed in a dependent service, often after a missing record or stale delivery tag.", "Inspect the downstream service log, retry policy, and message ack flow; make the upstream idempotent and stop retrying permanent 404s.");

  // Auth stack.
  add(/api token is not valid|authentication failed|unauthenticated: authentication/, "Invalid or expired API token.", "The client presented a token that auth-service rejected — expired, revoked, or signed with a stale key.", "Re-issue the token, check auth-service key rotation, and verify the client refresh flow actually replaces expired tokens.");
  add(/unauthorizedexception|forbiddenexception|authentication required/, "Request reached a protected route without valid credentials.", "Missing/expired session or JWT, or role lacks access. High volume usually = one misconfigured client or frontend retry loop.", "Identify the calling client via gateway logs; fix its token handling. If volume is bursty, add rate limiting on the auth error path.");

  // WhatsApp / Baileys.
  add(/whatsapp session not found|please reconnect your device/, "WhatsApp session lost.", "The Baileys session was disconnected (device unlinked, phone offline, or session store wiped).", "Reconnect the device from the WhatsApp Web integration page; check session persistence in the store; alert the account owner.");
  add(/promisetimeout|request time-out|baileys/, "WhatsApp gateway timeout.", "Baileys query to WhatsApp servers exceeded its internal timeout — phone offline or WA server latency.", "Check device connectivity, and treat as transient unless it persists across runs.");

  // Data-shape bugs.
  add(/cannot transform invalid string to objectid/, "Invalid ObjectId cast.", "Code passed a literal string (e.g. \"system\") where a Mongo ObjectId was required — a real bug, not user input.", "Find the caller passing the literal; guard system/internal actors before the ObjectId cast. This is fixable in code, not ops.");
  add(/insufficient token/, "Payment/quota balance exhausted.", "The tenant's token/credit balance is too low for the requested operation.", "Top up or adjust the tenant quota; add a pre-check so the operation fails gracefully before hitting the service.");
  add(/badrequestexception|validationpipe/, "Request payload failed validation.", "Client sent a body that violates the DTO schema (missing/typed-wrong fields).", "Check which endpoint via gateway logs; fix the client payload. Recurring volume = frontend bug, not user error.");

  // Noise / stack-frame categories.
  add(/errorcontext\.js|callerrorfromstatus|handlebaserepositoryerror/, "Stack-trace frame, not a distinct error.", "The collector captured an interior stack line of another error (rxjs/grpc wrapper frames).", "Ignore as its own category — the real error is the sibling category with the actual message. Consider filtering these frames in the collector.");

  function analyze(service, message) {
    const hay = ((service || "") + " " + (message || "")).toLowerCase();
    for (const r of RULES) if (r.re.test(hay)) return r;
    return fallback(hay);
  }

  function fallback(hay) {
    if (/unauthor|forbidden|unauthenticated|token/.test(hay))
      return { what: "Authentication/authorization failure.", why: "Missing, expired, or invalid credentials/token, or the caller lacks permission for the resource.", fix: "Check token issuance & expiry, verify the auth guard/role on the route, and confirm the client sends a valid Authorization header." };
    if (/not found|no such|does not exist/.test(hay))
      return { what: "A referenced record was not found.", why: "The ID passed in no longer exists (deleted, wrong tenant, or race with creation).", fix: "Validate the ID exists before use; return a clean 404 instead of throwing; check for cross-tenant/stale references." };
    if (/timeout|timed out|etimedout|deadline/.test(hay))
      return { what: "Operation timed out.", why: "A downstream call (DB, gRPC, HTTP, socket) exceeded its deadline — slow dependency or network stall.", fix: "Raise/verify timeouts, add retries with backoff, and check the health/latency of the downstream service." };
    if (/econnrefused|econnreset|socket|disconnect/.test(hay))
      return { what: "Connection error to a dependency.", why: "Target service is down, restarting, or dropped the connection.", fix: "Confirm the dependency is up, check pod restarts/OOM, and add reconnect logic." };
    return { what: "Unclassified error.", why: "No specific rule matched this message pattern yet.", fix: "Inspect the raw message and stack; if this recurs, add a rule to error-analyzer.js RULES." };
  }

  return { analyze, _rules: RULES, _add: add };
})();
