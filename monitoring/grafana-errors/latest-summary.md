# Grafana Error Pull — last run 2026-10-13T19:30:36
Window: 5m | total errors: 19

| n | kategori |
|---|---|
| 4 | api-gateway | - | UnauthorizedException: Unauthorized Exception |
| 2 | auth-service | - | Error: API token is not valid |
| 2 | auth-service | - | [31m[Nest] 7  - [39m10/13/2026, 12:27:49 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[5010]: API token is not valid[39m |
| 2 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 12:30:15 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Internal server error[39m |
| 2 | api-gateway | - | ForbiddenException: Authentication required |
| 2 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 12:27:49 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Authentication required[39m |
| 1 | mongodb | - | {"t":{"$date":"2026-10-13T12:26:49.624+00:00"},"s":"I",  "c":"CONNPOOL", "id":22572,   "ctx":"MongotExecutor","msg":"Dropping all pooled connections", |
| 1 | channel-service | - | Error: Account channel with id <n> not found not found |
| 1 | channel-service | - | [31m[Nest] 8  - [39m10/13/2026, 12:29:09 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not  |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 12:30:17 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Internal server error[39m |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 12:30:12 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Internal server error[39m |
