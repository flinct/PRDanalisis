# Grafana Error Pull — last run 2026-09-16T15:37:53
Window: 5m | total errors: 1751

| n | kategori |
|---|---|
| 64 | channel-service | - | Error: Account channel with id <n> not found not found |
| 45 | api-gateway | - | at Object.errorContext (/app/node_modules/rxjs/dist/cjs/internal/util/errorContext.js:22:9) |
| 45 | api-gateway | - | at callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:32:19) |
| 39 | api-gateway | - | at ValidationPipe.exceptionFactory (/app/node_modules/@nestjs/common/pipes/validation.pipe.js:107:20) |
| 39 | api-gateway | - | BadRequestException: Bad Request Exception |
| 39 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:36:07 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Sender is not complete or not a v |
| 33 | api-gateway | - | Error: 5 NOT_FOUND: Account Channel not found |
| 33 | broadcast-service | - | Error: Account Channel not found |
| 33 | broadcast-service | - | at Object.errorContext [90m(/app/[39mnode_modules/[4mrxjs[24m/dist/cjs/internal/util/errorContext.js:22:9[90m)[39m |
| 33 | broadcast-service | - | at callErrorFromStatus [90m(/app/[39mnode_modules/[4m@grpc[24m/grpc-js/build/src/call.js:32:19[90m)[39m |
| 20 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:36:08 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Account Channel not found[39m |
| 20 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:36:08 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account Channel not found[39m |
| 20 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:36:08 AM [31m  ERROR[39m [38;5;3m[BroadcastService] [39mError: 5 NOT_FOUND: Account channel with id <n> not fo |
| 18 | channel-service | - | [31m[Nest] 9  - [39m09/16/2026, 8:36:08 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 16 | people-service | - | Error: Client Contact with id <n>@s.whatsapp.net not found |
| 15 | api-gateway | - | UnauthorizedException: Authentication required |
| 15 | channel-service | - | [31m[Nest] 9  - [39m09/16/2026, 8:36:07 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 13 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:36:07 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Account Channel not found[39m |
| 13 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:36:07 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account Channel not found[39m |
| 13 | broadcast-service | - | [31m[Nest] 6  - [39m09/16/2026, 8:36:07 AM [31m  ERROR[39m [38;5;3m[BroadcastService] [39mError: 5 NOT_FOUND: Account channel with id <n> not fo |
| 12 | api-gateway | - | Error: 16 UNAUTHENTICATED: Authentication failed |
| 12 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:37:20 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication failed[39m |
| 12 | auth-service | - | at RefreshTokenStrategy.handleAuthenticationError (/app/main.js:21952:15) |
| 12 | auth-service | - | UnauthorizedException: Authentication failed |
| 12 | auth-service | - | [31m[Nest] 7  - [39m09/16/2026, 8:37:20 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[undefined]: Authentication failed[39m |
| 12 | auth-service | - | [31m[Nest] 7  - [39m09/16/2026, 8:37:20 AM [31m  ERROR[39m [38;5;3m[JwtTokenService] [39mTokenExpiredError: jwt expired |
| 12 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:33:42 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: error:1C800064:Provider routines::bad dec |
| 12 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:33:42 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39m[31mdownloadAndUploadMedia[39m |
| 10 | api-gateway | - | [31m[Nest] 8  - [39m09/16/2026, 8:37:19 AM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 10 | whatsapp | - | [31m[Nest] 7  - [39m09/16/2026, 8:36:57 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: error:1C800064:Provider routines::bad dec |
