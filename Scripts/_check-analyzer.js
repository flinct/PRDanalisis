// Self-check: ErrorAnalyzer maps real messages to non-fallback rules where expected.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "Test", "modules", "error-analyzer.js"), "utf8"), ctx);
const A = ctx.window.ErrorAnalyzer;
const cases = [
  ["people-service", "Error: TeamMember not found", "Lookup target missing."],
  ["auth-service", "Error: API token is not valid", "Invalid or expired API token."],
  ["broadcast-service", "SOCKET_ERROR: WhatsApp session not found. Please reconnect your device.", "WhatsApp session lost."],
  ["people-service", "Error: Cannot transform invalid string to objectId: system", "Invalid ObjectId cast."],
  ["ticket-service", "Webhook TICKET_UPDATED failed after 3 attempts for", "Downstream workflow failure."],
  ["payment-service", "Error: Insufficient TOKEN", "Payment/quota balance exhausted."],
  ["api-gateway", "at Object.errorContext (/app/node_modules/rxjs/dist/cjs/internal/util/errorContext.js:22:9)", "Stack-trace frame, not a distinct error."],
];
let ok = 0;
for (const [svc, msg, want] of cases) {
  const a = A.analyze(svc, msg);
  const pass = a.what === want;
  console.log((pass ? "OK  " : "FAIL") + "  " + svc + " → " + a.what);
  if (!pass) throw new Error("expected: " + want + " got: " + a.what);
  ok++;
}
// fallback still returns shape
const fb = A.analyze("x", "totally novel gibberish");
if (!fb.what || !fb.why || !fb.fix) throw new Error("fallback missing fields");
console.log("rules:", A._rules.length, "| cases OK:", ok, "| SELF-CHECK OK");
