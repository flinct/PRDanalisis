# Grafana Error Pull — last run 2026-10-14T20:56:41
Window: 5m | total errors: 49

| n | kategori |
|---|---|
| 4 | api-gateway | - | ForbiddenException: Authentication required |
| 4 | auth-service | - | Error: API token is not valid |
| 4 | whatsapp | - | message: [32m'Stream Errored (conflict)'[39m |
| 4 | whatsapp | - | error: [32m'Unknown'[39m, |
| 3 | channel-service | - | Error: Account channel with id <n> not found not found |
| 2 | api-gateway | - | [31m[Nest] 8  - [39m10/14/2026, 1:53:41 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 2 | api-gateway | - | [31m[Nest] 8  - [39m10/14/2026, 1:51:59 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 2 | auth-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:53:41 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[5010]: API token is not valid[39m |
| 2 | auth-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:51:59 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[5010]: API token is not valid[39m |
| 1 | api-gateway | - | NotFoundException: Cannot GET / |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/14/2026, 1:53:32 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Cannot GET /[39m |
| 1 | channel-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:56:22 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | channel-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:55:59 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | channel-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:54:24 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | conversation-service | - | at Object.errorContext [90m(/app/[39mnode_modules/[4mrxjs[24m/dist/cjs/internal/util/errorContext.js:22:9[90m)[39m |
| 1 | conversation-service | - | at callErrorFromStatus [90m(/app/[39mnode_modules/[4m@grpc[24m/grpc-js/build/src/call.js:32:19[90m)[39m |
| 1 | conversation-service | - | [95m[Nest] 9  - [39m10/14/2026, 1:54:24 PM [95m  DEBUG[39m [38;5;3m[ConversationService] [39mError: 5 NOT_FOUND: Team not found |
| 1 | mongodb | - | {"t":{"$date":"2026-10-14T13:55:07.291+00:00"},"s":"I",  "c":"CONNPOOL", "id":22572,   "ctx":"MongotExecutor","msg":"Dropping all pooled connections", |
| 1 | people-service | - | Error: Team not found |
| 1 | people-service | - | [31m[Nest] 7  - [39m10/14/2026, 1:54:24 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2021]: Team not found[39m |
| 1 | whatsapp | - | message: [32m'An internal server error occurred'[39m |
| 1 | whatsapp | - | error: [32m'Internal Server Error'[39m, |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/14/2026, 1:56:18 PM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: item-not-found |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/14/2026, 1:54:27 PM [31m  ERROR[39m [38;5;3m[WhatsAppConnectionService] [39m[31m[baileys] stream errored out[39m |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/14/2026, 1:54:25 PM [31m  ERROR[39m [38;5;3m[WhatsAppConnectionService] [39m[31m[baileys] stream errored out[39m |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/14/2026, 1:54:28 PM [33m   WARN[39m [38;5;3m[WhatsAppConnectionService] [39mError: Stream Errored (conflict) |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/14/2026, 1:54:28 PM [33m   WARN[39m [38;5;3m[BaileysService] [39mError: Stream Errored (conflict) |
| 1 | whatsapp | - | [95m[Nest] 7  - [39m10/14/2026, 1:54:28 PM [95m  DEBUG[39m [38;5;3m[BaileysService] [39m[95m{"connection":"close","lastDisconnect":{"error":{"d |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/14/2026, 1:54:25 PM [33m   WARN[39m [38;5;3m[WhatsAppConnectionService] [39mError: Stream Errored (conflict) |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/14/2026, 1:54:25 PM [33m   WARN[39m [38;5;3m[BaileysService] [39mError: Stream Errored (conflict) |
