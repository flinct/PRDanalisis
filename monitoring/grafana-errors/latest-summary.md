# Grafana Error Pull — last run 2026-10-10T21:51:59
Window: 5m | total errors: 9

| n | kategori |
|---|---|
| 2 | api-gateway | - | NotFoundException: Cannot GET / |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/10/2026, 2:51:15 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Cannot GET /[39m |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/10/2026, 2:49:17 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Cannot GET /[39m |
| 1 | conversation-service | - | at Object.errorContext [90m(/app/[39mnode_modules/[4mrxjs[24m/dist/cjs/internal/util/errorContext.js:22:9[90m)[39m |
| 1 | conversation-service | - | at callErrorFromStatus [90m(/app/[39mnode_modules/[4m@grpc[24m/grpc-js/build/src/call.js:32:19[90m)[39m |
| 1 | conversation-service | - | [95m[Nest] 8  - [39m10/10/2026, 2:50:42 PM [95m  DEBUG[39m [38;5;3m[ConversationService] [39mError: 5 NOT_FOUND: Team not found |
| 1 | people-service | - | Error: Team not found |
| 1 | people-service | - | [31m[Nest] 8  - [39m10/10/2026, 2:50:42 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2021]: Team not found[39m |
