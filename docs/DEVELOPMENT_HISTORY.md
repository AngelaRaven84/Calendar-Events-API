# Calendar Events API

Serverless REST API för kalenderanvändare och händelser med AWS Lambda, API Gateway HTTP API och DynamoDB. Backend till [Calendar](https://github.com/AngelaRaven84/Calendar).

**Status 22 september 2026:** JWT-skyddat CRUD deployat med IAM-användaren Sara via profilen school. Sara har verifierat API:t i Insomnia och hela CRUD-flödet via Calendar både lokalt och på S3. Deployment Bootcamp, övning 3, är klar.

## Funktioner och teknik

Node.js 24/ARM64, Serverless Framework 4, AWS SDK v3, Middy, Zod och jose.

- Registrering med name, username, email och password. Zod normaliserar användarnamn/e-post och validerar lösenord (15–128 tecken).
- Saltad scrypt-hash; lösenord och hash returneras inte i API-svar.
- Unika användarnamn/e-postadresser genom villkorad transaktion med lookup-poster i Calendar-users.
- Login med identifier (användarnamn eller e-post) och password.
- HS256 JWT med sub, issuer/audience calendar-events-api och giltighet 15 minuter.
- requireAuth verifierar tokenen och kräver att URL:ens userId matchar sub. Handlers använder event.auth.userId.
- CRUD i DynamoDB med Zod-validering och tidskrockskontroll. Tider kant i kant tillåts.

## Routes

| Metod | Sökväg | Auth | Lyckat svar |
| --- | --- | --- | --- |
| POST | /users | Öppen registrering | 201 med userId och name |
| POST | /login | Öppen login | 200 med accessToken, tokenType, expiresIn |
| GET | /users/{userId} | Bearer, samma användare | 200 med userId och name |
| GET | /users/{userId}/events | Bearer, samma användare | 200 med lista, även [] |
| POST | /users/{userId}/events | Bearer, samma användare | 201 med sparad händelse |
| GET | /users/{userId}/events/{id} | Bearer, samma användare | 200 med händelse |
| PATCH | /users/{userId}/events/{id} | Bearer, samma användare | 200 med uppdaterad händelse |
| DELETE | /users/{userId}/events/{id} | Bearer, samma användare | 200 med meddelande och borttagen händelse |

Saknad/ogiltig/utgången token ger 401; annan användares userId med giltig token ger 403. Ett saknat event för den egna användaren ger 404. Gamla tester där fel userId gav 404 gjordes före JWT-skyddet och beskriver inte dagens auth-beteende.

Använd JSON-body och Content-Type: application/json vid POST/PATCH. Exempel för en händelse:

~~~json
{
  "title": "Studiepass",
  "date": "2026-09-22",
  "startTime": "10:00",
  "endTime": "11:00"
}
~~~

Backend genererar id och userId; skicka inte dem i event-body. PATCH accepterar ett eller flera av de fyra fälten. Tom body, okända fält och ogiltig tid avvisas med 400. Sluttiden måste vara efter starttiden. Överlapp ger 409.

## Datamodell

Tabeller i eu-north-1, skapade utanför Serverless-konfigurationen:

| Tabell | Partition key | Sort key | Innehåll |
| --- | --- | --- | --- |
| Calendar-db | userId (String) | id (String) | title, date, startTime, endTime |
| Calendar-users | userId (String) | Ingen | Användare med name, username, email, passwordHash; separata USERNAME#/EMAIL# lookup-poster |

Eventlista använder Query på userId. Get/Update/Delete använder båda nycklarna. POST kontrollerar att användaren finns. Äldre användare utan lösenord/lookup-poster kan inte använda den nya inloggningen utan en separat migrering eller ny registrering.

## Struktur

- functions/events: fem skyddade CRUD-handlers.
- functions/users: registrering, login och skyddad profilhämtning.
- services: DynamoDB-operationer, lösenordshashning och JWT.
- models: valideringsscheman för användare, login och event.
- middlewares: requireAuth, validateBody och errorHandler.
- serverless.yml: routes, CORS, miljöreferens och Lambdas IAM-roll.

## Lokal konfiguration och deploy

Använd Node.js 24, npm, AWS CLI och Serverless Framework 4. Installera med npm ci. JWT_SECRET ska finnas i backendens lokala miljö som 64 hextecken (32 slumpade byte); den förs till Lambda via provider.environment. Dela inte värdet och lägg det aldrig i frontend, Git eller dokumentation. .env och .serverless ignoreras av Git; deploymentpaket kan innehålla miljövärden.

~~~powershell
aws sts get-caller-identity --profile school --query Arn --output text
npx serverless package --aws-profile school --stage dev --region eu-north-1
npx serverless deploy --aws-profile school --stage dev --region eu-north-1
~~~

provider.profile är school, verifierad av Sara som user/Sara. Stack: calendar-events-api-dev. Lambdas execution role: calendar-events-api-dev-eu-north-1-lambdaRole. IAM-användaren deployar; rollen ger funktionerna DynamoDB-åtkomst. De är olika identiteter.

Sara kopplade CalendarDeploymentAccess som komplement till sina befintliga policyer och bekräftade lyckad deploy. Policyn begränsar sina tillägg till Calendar-stacken, den befintliga rollen och dess loggrupper; Saras sammanlagda behörigheter omfattar även bredare befintliga policyer. LambdaBootcamp och Bonz.ai-resurserna togs inte bort. Ingen fullständig liveinventering av IAM gjordes av agenten.

## CORS och frontend

Tillåtna origins i serverless.yml:

- http://calendar-bucket-260921.s3-website.eu-north-1.amazonaws.com
- http://localhost:5173

Tillåtna headers: Content-Type och Authorization. Metoder: GET, POST, PATCH, DELETE, OPTIONS. CORS ersätter inte JWT-skyddet. Frontend använder basadressen i VITE_API_URL; Insomnia använder base_url. Frontendens S3-adress är HTTP i skolversionen; HTTPS för frontend återstår inför privat användning med riktiga uppgifter.

## Verifiering

**Sara, i AWS/Insomnia 22 september 2026:**

- school identifierades som user/Sara; paketering och deploy lyckades.
- Skyddad GET utan token: 401 Bearer token is required.
- Ny användare registrerades; login gav 200 med accessToken.
- GET med rätt token/användare: 200 och [] för tom lista.
- GET med samma token men annan användares ID: 403 Access denied.
- POST 201, GET by ID 200, PATCH 200 och efterföljande GET med bevarad ändring.
- DELETE 200, upprepad DELETE 404, GET by ID 404 och listan 200 med [].

**Sara, webbläsare lokalt och via S3:** felaktig login visar fel; korrekt login fungerar. Hela CRUD-flödet fungerar, ändringar består efter omladdning/ny inloggning och avbruten radering lämnar data kvar. CORS fungerar för dessa testade flöden.

**Agentkontroller under arbetet:** syntax/diff och kodgranskning av sex skyddade routes. Lokalt middleware-test med syntetiska tokenvärden gav 401 för saknad, felaktig och utgången token, 403 för fel användare och framgång för rätt användare. Avvisade anrop nådde inte testhandlern. Detta var ett lokalt test, inte ett AWS-test.

Det finns ingen incheckad automatiserad testsvit; npm test är en platshållare. Live-test av utgången/förfalskad token samt negativa ägarskapstest för POST/PATCH/DELETE efter denna deploy återstår; GET 403 bevisar inte att varje sådan route har testats separat.

## Kända begränsningar och nästa steg

- Datumvalideringen kontrollerar formatet, inte att kalenderdatumet finns.
- Query saknar paginering, även i tidskrockskontrollen.
- Tidskrockskontroll och skrivning är separata operationer, inte samtidighetssäkrade.
- Refresh-tokenflöde saknas; ny login krävs efter 15 minuter.
- Tabellerna provisioneras inte av serverless.yml.

**Nästa steg:** Repetera det verifierade frontend–API–databasflödet inför eventuell munta. Utökad testning och förbättringarna ovan är senare arbete; bootcampens tre grundövningar är klara.
