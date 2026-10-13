# Grafana Error Pull — last run 2026-10-13T21:42:36
Window: 5m | total errors: 15

| n | kategori |
|---|---|
| 2 | channel-service | - | Error: Account channel with id <n> not found not found |
| 1 | api-gateway | - | NotFoundException: Cannot GET / |
| 1 | api-gateway | - | [31m[Nest] 8  - [39m10/13/2026, 2:40:41 PM [31m  ERROR[39m [38;5;3m[GrpcToHttpExceptionFilter] [39m[31mError: Cannot GET /[39m |
| 1 | channel-service | - | [31m[Nest] 8  - [39m10/13/2026, 2:39:47 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | channel-service | - | [31m[Nest] 8  - [39m10/13/2026, 2:39:29 PM [31m  ERROR[39m [38;5;3m[GrpcExceptionFilter] [39m[31mError[2041]: Account channel with id <n> not f |
| 1 | notification-service | - | err: Error: Channel closed by server: 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - delivery acknowledgement on channel 1 timed out. T |
| 1 | notification-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:38:56 PM [31m  ERROR[39m [38;5;3m[Server] [39mObject(1) { |
| 1 | notification-service | - | [31m[Nest] 7  - [39m10/13/2026, 2:38:56 PM [31m  ERROR[39m [38;5;3m[Server] [39m[31mDisconnected from RMQ. Trying to reconnect.[39m |
| 1 | whatsapp | - | message: [32m'An internal server error occurred'[39m |
| 1 | whatsapp | - | error: [32m'Internal Server Error'[39m, |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/13/2026, 2:39:49 PM [31m  ERROR[39m [38;5;3m[WhatsAppMessageService] [39mError: not-authorized |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/13/2026, 2:39:41 PM [31m  ERROR[39m [38;5;3m[WhatsAppConnectionService] [39m[31m[baileys] failed to decrypt message[39m |
| 1 | whatsapp | - | [31m[Nest] 7  - [39m10/13/2026, 2:39:41 PM [31m  ERROR[39m [38;5;3m[WhatsAppConnectionService] [39m[31m[baileys] transaction failed, rolling ba |
| 1 | whatsapp | - | error: [32m'No session found to decrypt message'[39m, |
