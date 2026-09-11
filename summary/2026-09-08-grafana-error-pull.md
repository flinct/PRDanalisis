# 2026-09-08 — Grafana error pull

## Scope
- Connect Hermes/local tooling to SatuInbox Grafana at `https://monitoring.satuinbox.com`.
- Enable 5-minute Loki error pulls grouped by category.
- Check whether MongoDB restart alerts already exist.

## Changes
- Created skill: `satuinbox-grafana`.
- Created Grafana wrapper earlier in session:
  - `C:\Users\MyBook SAGA 12\.local\bin\grafana`
  - `C:\Users\MyBook SAGA 12\.local\bin\grafana_fmt.py`
- Created error puller:
  - `monitoring/grafana-errors/pull_errors.py`
  - Output: `monitoring/grafana-errors/YYYY-MM-DD.jsonl`
  - Latest summary: `monitoring/grafana-errors/latest-summary.md`
- Created Hermes cron entrypoint:
  - `C:\Users\MyBook SAGA 12\.hermes\scripts\grafana-error-pull.py`
- Created cron job:
  - Job ID: `64dac871d1aa`
  - Name: `grafana-error-pull`
  - Schedule: `every 5m`
  - Mode: `no_agent=true`
  - Delivery: `local`

## Verification
- Grafana health: v11.3.0, database ok.
- Data sources found: Prometheus (`prometheus-ds`), Loki (`loki-ds`), Alertmanager, CloudWatch.
- `python monitoring/grafana-errors/pull_errors.py --test` returned `self-check OK`.
- Manual run returned `854 errors, 393 categories -> 2026-09-08.jsonl`.
- Immediate cron run was triggered in background (`deleg_23e50c2f`); final completion result may arrive asynchronously.

## Alert notes
- Existing Grafana rules: Pod Crashing Looping, WhatsApp Connection Alert, Pod Restarting Frequently, Pod Not Ready, Target Down.
- MongoDB pods are `mongodb-0/1/2` in namespace `default`.
- DB restart is covered indirectly by pod restart/not-ready rules, but there is no dedicated MongoDB-level restart/down alert.
- Dedicated DB rule candidates:
  - `resets(kube_pod_container_status_restarts_total{pod=~"mongodb-[0-9]+"}[5m]) > 0`
  - `mongodb_up == 0`

## Security
- User shared Grafana password in chat; redacted here. Recommend rotating if sensitive.
- Credentials stored in `~/.grafana_env` with `chmod 600`, outside repo.

## Transcript (redacted)

### Turn 1 — User
Asked whether Hermes can connect to Grafana.

### Turn 2 — Assistant
Checked options, confirmed no built-in Grafana tool, proposed MCP/HTTP API/datasource direct. Asked which Grafana, purpose, and connection method.

### Turn 3 — User
Provided Grafana URL `https://monitoring.satuinbox.com/?from=now-6h&to=now&timezone=browser`; purpose: query metrics/logs and read/manage alerts.

### Turn 4 — Assistant
Tested connectivity. Browser daemon failed. Terminal curl showed TLS revocation issue; `--ssl-no-revoke` fixed it. API returned 401 without auth. Asked for service account token or credentials.

### Turn 5 — User
Provided viewer account username and password. Password redacted: `[REDACTED]`.

### Turn 6 — Assistant
Tested Basic Auth. Confirmed user API, org, datasource access, alert-rule access. Created local credential file and Grafana wrapper. Replaced jq with python formatter because jq was not installed. Verified datasources, dashboards, alerts, PromQL, Loki labels.

### Turn 7 — User
Asked to create a skill, plan future log-error alerts, and whether DB restart already has an alert.

### Turn 8 — Assistant
Read alert rules. Confirmed no dedicated DB restart alert, but MongoDB pod restart is indirectly covered by pod-level rules because MongoDB pods live in namespace `default`. Created `satuinbox-grafana` skill.

### Turn 9 — User
Asked whether Hermes can pull error data every 5 minutes and group by same category.

### Turn 10 — Assistant
Loaded relevant skills/rules. Sampled Loki logs, implemented `monitoring/grafana-errors/pull_errors.py`, fixed Loki matcher issue, verified test/manual run, created cron job `64dac871d1aa`, and updated `satuinbox-grafana` skill with cron details.
