# Calendar Events API

Ett serverless REST API för användare och kalenderhändelser. Projektet är en skolövning i AWS Lambda, API Gateway, DynamoDB, validering och API-testning.

## Funktionalitet

- Skapa och hämta användare.
- Skapa, lista, hämta, uppdatera och radera event med permanent lagring i DynamoDB.
- Validera event med Zod och hantera JSON-body med Middy.
- Kontrollera tidsöverlapp inom samma användares event på samma datum. Tider kant i kant tillåts.

## Teknik och struktur

Node.js 24, AWS Lambda (ARM64), API Gateway HTTP API, Serverless Framework 4, AWS SDK v3, Middy och Zod.

| Mapp eller fil | Ansvar |
| --- | --- |
| `functions/events/` | Lambda-handlers för eventens CRUD |
| `functions/users/` | Skapa och hämta användare |
| `services/` | DynamoDB-klient och databasoperationer |
| `models/eventSchema/` | Zod-scheman för POST och PATCH |
| `middlewares/` | Body-validering och felhantering |
| `responses/` | Gemensamt HTTP-svar |
| `serverless.yml` | Lambda-funktioner, routes och IAM-behörigheter |

## Datamodell

Projektet använder två separata DynamoDB-tabeller i `eu-north-1`:

| Tabell | Partition key (String) | Sort key (String) | Övriga fält |
| --- | --- | --- | --- |
| `Calendar-users` | `userId` | Ingen | `name` |
| `Calendar-db` | `userId` | `id` | `title`, `date`, `startTime`, `endTime` |

API:t genererar UUID för användare och event. Eventlistan hämtas med `QueryCommand` på `userId`. Ett enskilt event hämtas med `GetCommand` och båda nycklarna. POST kontrollerar att användaren finns innan eventet skapas.

## Routes

| Metod | Sökväg | Funktion | Lyckat svar |
| --- | --- | --- | --- |
| POST | `/users` | Skapa användare | 201 |
| GET | `/users/{userId}` | Hämta användare | 200 |
| POST | `/users/{userId}/events` | Skapa event | 201 |
| GET | `/users/{userId}/events` | Lista användarens event | 200 |
| GET | `/users/{userId}/events/{id}` | Hämta ett event | 200 |
| PATCH | `/users/{userId}/events/{id}` | Uppdatera event | 200 |
| DELETE | `/users/{userId}/events/{id}` | Radera event | 200 |

En tom eventlista ger `200` med `[]`. Ett enskilt event som saknas ger `404`. DELETE returnerar ett meddelande och det borttagna eventet; upprepad DELETE ger `404`.

Använd JSON-body och `Content-Type: application/json` för POST och PATCH. Exempel för POST av event:

```json
{
  "title": "Studiepass",
  "date": "2026-09-10",
  "startTime": "10:00",
  "endTime": "11:00"
}
```

PATCH accepterar ett eller flera av dessa fält. `{}`, okända fält eller ogiltiga fältvärden avvisas med `400`. Den sammanslagna händelsen valideras också: sluttiden måste ligga efter starttiden. Tidsöverlapp ger `409`.

POST `/users` tar en JSON-body med `name`.

## Installation och deploy

Förutsättningar: Node.js 24, npm, AWS CLI med en konfigurerad profil `school` samt tillgång till Serverless Framework 4.

```powershell
npm ci
aws sts get-caller-identity --profile school
```

Kontrollera att profilen pekar på avsett skolkonto. Tabellerna ovan måste redan finnas med rätt nycklar; de skapas inte av `serverless.yml`. IAM-resurserna i konfigurationen behöver motsvara tabellerna i det konto som används. Lambda-rollen behöver PutItem, Query, GetItem, UpdateItem och DeleteItem för eventtabellen samt PutItem och GetItem för användartabellen.

```powershell
$env:AWS_PROFILE = "school"
npx serverless deploy --stage dev --region eu-north-1
```

Ändrade routes kräver en full deploy. Använd den deployade API-adressen som miljövariabeln `base_url` i Insomnia. Spara credentials i lokal AWS-konfiguration och lägg inte in dem i projektet.

## Teststatus

Sara har manuellt verifierat följande genom Insomnia efter deploy den 10 september 2026:

- POST med användar-id ger `201`; efterföljande GET ger `200` med det sparade eventet.
- GET av ett event med rätt nycklar ger `200`; samma event-id under en annan användare ger `404`.
- PATCH ändrar titeln och efterföljande GET bekräftar att den sparats.
- PATCH med en annan användares id misslyckas och ändringen sparas inte.
- PATCH med `{}` ger `400`.
- DELETE med en annan användares id ger `404`; eventet finns kvar hos rätt användare.
- DELETE med rätt nycklar ger `200`; eventet försvinner från listan och enskild GET samt upprepad DELETE ger `404`.
- En tom eventlista ger `200` med `[]`.

Syntaxkontroller av de ändrade handlers och `git diff --check` har passerat lokalt. HTTP-resultaten är Saras manuellt rapporterade tester. Det finns ingen automatiserad testsvit, lint- eller build-script; `npm test` är fortfarande en platshållare som avslutas med fel.

## Begränsningar och planerat arbete

- Inloggning, JWT och authorization saknas. `userId` i URL:en väljer data men bevisar inte vem som anropar API:t. Kända nycklar kan användas av andra anropare.
- Skapande av användare saknar Zod-validering och den gemensamma felhanteringen.
- Datumvalideringen kontrollerar formatet `YYYY-MM-DD`, inte om datumet faktiskt finns i kalendern.
- Eventlistan saknar paginering; servicefunktionen läser bara en Query-sida.
- Konfliktkontrollen gör läsning och skrivning separat. Samtidiga anrop kan skapa tidsöverlapp; detta är inte samtidighetstestat.
- Databastabellerna hanteras utanför Serverless-konfigurationen.
- Koppling till Calendar-frontend är planerad och ännu inte genomförd.
