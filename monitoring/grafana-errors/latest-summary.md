# Grafana Error Pull — last run 2026-10-13T09:32:03
Window: 5m | total errors: 310

| n | kategori |
|---|---|
| 16 | whatsapp | - | message: [32m'Stream Errored (conflict)'[39m |
| 16 | whatsapp | - | error: [32m'Unknown'[39m, |
| 14 | auth-service | - | at RefreshTokenStrategy.handleAuthenticationError (/app/main.js:22233:15) |
| 14 | auth-service | - | UnauthorizedException: Authentication failed |
| 14 | api-gateway | - | at Object.errorContext (/app/node_modules/rxjs/dist/cjs/internal/util/errorContext.js:22:9) |
| 14 | api-gateway | - | at callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:32:19) |
| 14 | api-gateway | - | Error: 16 UNAUTHENTICATED: Authentication failed |
| 13 | api-gateway | - | UnauthorizedException: Authentication required |
| 11 | channel-service | - | Error: Account channel with id <n> not found not found |
| 7 | api-gateway | - | ForbiddenException: Insufficient permission |
| 7 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 2:28:12 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 6 | conversation-service | - | Error: CSAT not found for this conversation not found |
| 6 | auth-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:28:13 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[undefined]: Authentication failed[39m |
| 6 | auth-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:28:13 AM [31m  ERROR[39m [38;5;3m[JwtTokenService] [39mTokenExpiredError: jwt expired |
| 6 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 2:28:13 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication failed[39m |
| 5 | auth-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:28:12 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[undefined]: Authentication failed[39m |
| 5 | auth-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:28:12 AM [31m  ERROR[39m [38;5;3m[JwtTokenService] [39mTokenExpiredError: jwt expired |
| 5 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 2:28:12 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication failed[39m |
| 4 | people-service | - | Error: Team not found |
| 4 | conversation-service | - | at Object.errorContext [90m(/app/[39mnode_modules/[4mrxjs[24m/dist/cjs/internal/util/errorContext.js:22:9[90m)[39m |
| 4 | conversation-service | - | at callErrorFromStatus [90m(/app/[39mnode_modules/[4m@grpc[24m/grpc-js/build/src/call.js:32:19[90m)[39m |
| 3 | whatsapp | - | error: [32m'No session found to decrypt message'[39m, |
| 2 | whatsapp | - | error: [32m'Precondition Required'[39m, |
| 2 | whatsapp | - | [33m[Nest] 7  - [39m10/13/2026, 2:27:13 AM [33m   WARN[39m [38;5;3m[WhatsAppConnectionService] [39mError: Stream Errored (conflict) |
| 2 | whatsapp | - | [33m[Nest] 7  - [39m10/13/2026, 2:27:13 AM [33m   WARN[39m [38;5;3m[BaileysService] [39mError: Stream Errored (conflict) |
| 2 | whatsapp | - | [95m[Nest] 7  - [39m10/13/2026, 2:27:13 AM [95m  DEBUG[39m [38;5;3m[BaileysService] [39m[95m{"connection":"close","lastDisconnect":{"error":{"d |
| 2 | whatsapp | - | message: [32m'An internal server error occurred'[39m |
| 2 | whatsapp | - | error: [32m'Internal Server Error'[39m, |
| 2 | whatsapp | - | [31m[Nest] 7  - [39m10/13/2026, 2:27:13 AM [31m  ERROR[39m [38;5;3m[WhatsAppConnectionService] [39m[31m[baileys] stream errored out[39m |
| 2 | people-service | - | Error: Client Contact with id <n> not found |
