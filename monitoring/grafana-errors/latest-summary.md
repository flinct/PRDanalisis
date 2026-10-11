# Grafana Error Pull — last run 2026-10-11T15:09:59
Window: 5m | total errors: 13

| n | kategori |
|---|---|
| 2 | channel-service | - | Error: Account channel with id <n> not found not found |
| 2 | whatsapp | - | error: [32m'Request Time-out'[39m, |
| 2 | whatsapp | - | stack: [32m'Error\n    at promiseTimeout (file:///app/node_modules/baileys/lib/Utils/generics.js:116:19)\n    at query (file:///app/node_modules/bail |
| 1 | channel-service | - | [31m[Nest] 6  - [39m10/11/2026, 8:09:32 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | channel-service | - | [31m[Nest] 6  - [39m10/11/2026, 8:05:41 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | mongodb | - | {"t":{"$date":"2026-10-11T08:07:23.852+00:00"},"s":"I",  "c":"CONNPOOL", "id":22572,   "ctx":"MongotExecutor","msg":"Dropping all pooled connections", |
| 1 | people-service | - | Error: Client Contact with id <hex>@g.us not found |
| 1 | people-service | - | [31m[Nest] 8  - [39m10/11/2026, 8:09:02 AM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2021]: Client Contact with id <hex>@g.us |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/11/2026, 8:06:11 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: Timed Out |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/11/2026, 8:06:09 AM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: Timed Out |
