# Grafana Error Pull — last run 2026-10-13T21:48:35
Window: 5m | total errors: 14

| n | kategori |
|---|---|
| 2 | channel-service | - | Error: Account channel with id <n> not found not found |
| 2 | whatsapp | - | error: [32m'Precondition Required'[39m, |
| 1 | api-gateway | - | NotFoundException: Cannot GET / |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 2:43:52 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Cannot GET /[39m |
| 1 | channel-service | - | [31m[Nest] 8  - [39m10/13/2026, 2:47:57 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | channel-service | - | [31m[Nest] 8  - [39m10/13/2026, 2:43:39 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | mongodb | - | {"t":{"$date":"2026-10-13T14:45:16.403+00:00"},"s":"I",  "c":"CONNPOOL", "id":22572,   "ctx":"MongotExecutor","msg":"Dropping all pooled connections", |
| 1 | people-service | - | Error: Client Contact with id <n> not found |
| 1 | people-service | - | [31m[Nest] 6  - [39m10/13/2026, 2:43:50 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2021]: Client Contact with id <n> not fo |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/13/2026, 2:45:26 PM [33m   WARN[39m [38;5;3m[WhatsAppConnectionService] [39mError: Connection Terminated |
| 1 | whatsapp | - | [33m[Nest] 7  - [39m10/13/2026, 2:45:26 PM [33m   WARN[39m [38;5;3m[BaileysService] [39mError: Connection Terminated |
| 1 | whatsapp | - | [95m[Nest] 7  - [39m10/13/2026, 2:45:26 PM [95m  DEBUG[39m [38;5;3m[BaileysService] [39m[95m{"connection":"close","lastDisconnect":{"error":{"d |
