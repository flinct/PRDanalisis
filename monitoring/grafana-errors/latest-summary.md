# Grafana Error Pull — last run 2026-09-16T15:19:52
Window: 5m | total errors: 1875

| n | kategori |
|---|---|
| 50 | api-gateway | - | at ValidationPipe.exceptionFactory (/app/node_modules/@nestjs/common/pipes/validation.pipe.js:107:20) |
| 50 | api-gateway | - | BadRequestException: Bad Request Exception |
| 42 | channel-service | - | Error: Account channel with id <n> not found not found |
| 40 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:18:08 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Sender is not complete or not a v |
| 30 | api-gateway | - | at Object.errorContext (/app/node_modules/rxjs/dist/cjs/internal/util/errorContext.js:22:9) |
| 30 | api-gateway | - | at callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:32:19) |
| 24 | api-gateway | - | UnauthorizedException: Authentication required |
| 21 | broadcast-service | - | SOCKET_ERROR: WhatsApp session not found. Please reconnect your device. |
| 21 | whatsapp | - | error: { |
| 18 | api-gateway | - | Error: 16 UNAUTHENTICATED: Authentication failed |
| 18 | auth-service | - | at RefreshTokenStrategy.handleAuthenticationError (/app/main.js:21952:15) |
| 18 | auth-service | - | UnauthorizedException: Authentication failed |
| 17 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:16:47 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: error:1C800064:Provider routines::bad dec |
| 17 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:16:47 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39m[31mdownloadAndUploadMedia[39m |
| 16 | people-service | - | Error: Client Contact with id <n>@lid not found |
| 16 | people-service | - | at handleBaseRepositoryError (/app/main.js:7583:11) |
| 16 | people-service | - | Error: Cannot transform invalid string to objectId: system |
| 12 | api-gateway | - | Error: 5 NOT_FOUND: Account Channel not found |
| 12 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:18:08 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Account Channel not found[39m |
| 12 | broadcast-service | - | Error: Account Channel not found |
| 12 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:18:08 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account Channel not found[39m |
| 12 | broadcast-service | - | at Object.errorContext [90m(/app/[39mnode_modules/[4mrxjs[24m/dist/cjs/internal/util/errorContext.js:22:9[90m)[39m |
| 12 | broadcast-service | - | at callErrorFromStatus [90m(/app/[39mnode_modules/[4m@grpc[24m/grpc-js/build/src/call.js:32:19[90m)[39m |
| 12 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:18:08 AM [31m  ERROR[39m [38;5;3m[BroadcastService] [39mError: 5 NOT_FOUND: Account channel with id <n> not fo |
| 12 | channel-service | - | [31m[Nest] 9  - [39m09/16/2026, 8:18:08 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 12 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:19:17 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: error:1C800064:Provider routines::bad dec |
| 12 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:19:17 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39m[31mdownloadAndUploadMedia[39m |
| 11 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:17:49 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication failed[39m |
| 11 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:17:49 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 11 | auth-service | - | [31m[Nest] 7  - [39m09/16/2026, 8:17:49 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[undefined]: Authentication failed[39m |
