# Calendar Events API

Det separata backendprojektet till min [Calendar-app](https://github.com/AngelaRaven84/Calendar). Jag bygger Calendar som ett pågående fritidsprojekt och har även vidareutvecklat API:t inom min utbildning till frontendutvecklare.

API:t hanterar användare, inloggning och användarspecifika kalenderhändelser. Det är byggt med Node.js, AWS Lambda, API Gateway och DynamoDB, med Middy för middleware och Zod för validering.

**Status: pågående utvecklingsprojekt, inte en färdig produktionstjänst.**

## Så hör projekten ihop

| Del | Ansvar |
| --- | --- |
| [Calendar frontend](https://github.com/AngelaRaven84/Calendar) | Gränssnitt, datumval, formulär och kalendernavigation i React. |
| Calendar Events API, detta repo | Registrering, JWT-inloggning, åtkomstkontroll, validering och permanent lagring i AWS. |

[Prova kalenderdemon](http://calendar-bucket-260921.s3-website.eu-north-1.amazonaws.com) utan konto. **Demon använder endast påhittade uppgifter i webbläsarens minne och anropar inte det här API:t.** Den visar frontendens funktioner, inte backendens driftstatus.

I frontendens separata kontoläge går anropen via API Gateway till Lambda och DynamoDB. API:t verifierar Bearer-tokenen och kontrollerar att användaren i sökvägen är samma person som tokenen tillhör. Frontendens skolpublicering använder fortfarande HTTP; använd inte riktiga inloggningsuppgifter där.

## Vad jag har arbetat med

- REST-routes för användare och kalenderhändelser, uppdelade i handlers och datatjänster.
- Registrering med normaliserade användarnamn och e-postadresser samt en DynamoDB-transaktion för unika inloggningsuppgifter.
- Saltad lösenordshashning med scrypt. Lösenord och hash returneras inte i API-svaren.
- JWT med jose, 15 minuters giltighet och middleware som kontrollerar token och användaråtkomst.
- Zod-validering av indata, partiell uppdatering och kontroll av överlappande tider.
- DynamoDB-operationer, CORS och Serverless-konfiguration för AWS.

## Teknik

Node.js 24, JavaScript ES-moduler, Serverless Framework 4, AWS Lambda ARM64, API Gateway HTTP API, DynamoDB, AWS SDK v3, Middy, Zod och jose.

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

## Lokal konfiguration

Använd Node.js 24 och installera beroenden:

```bash
npm ci
```

Det här är ett Lambda-projekt och har ingen lokal webbserver eller `npm start`. För att köra mot AWS behövs egna AWS-behörigheter, Serverless Framework 4 och DynamoDB-tabellerna ovan. Tabellerna skapas inte av den nuvarande Serverless-konfigurationen. Resursnamn, region, profil och CORS behöver anpassas till din miljö.

Konfigurera `JWT_SECRET` i backendens lokala miljö som 64 hextecken. Använd ett eget slumpgenererat värde och dela det aldrig. `.env`, `.env*` och `.serverless` ignoreras av Git, med undantag för en eventuell `.env.example`. Deploymentpaket kan innehålla miljövärden och ska inte publiceras. Hemligheter hör inte hemma i frontend.

Författarens befintliga skolmiljö använder profilen `school`, regionen `eu-north-1` och stacken `calendar-events-api-dev`. Exempel för den miljön, från mappen som innehåller `serverless.yml`:

```powershell
aws sts get-caller-identity --profile school --query Arn --output text
npx serverless deploy --aws-profile school --stage dev --region eu-north-1
```

Deployment är inte nödvändigt för att läsa koden eller prova frontendens demo. För frontendens kontoläge anges API-basadressen som `VITE_API_URL`. CORS tillåter skolans S3-origin och `http://localhost:5173`, med `Content-Type` och `Authorization`. CORS ersätter inte autentisering.

## Verifiering och begränsningar

**Historiskt verifierat av mig i september 2026:** registrering och login i Insomnia, 401 utan token, GET med rätt användare, 403 för annan användare samt skapa, hämta, uppdatera och radera händelser. Kontoflödet testades även genom Calendar lokalt och på S3, med lagrade ändringar efter ny inloggning.

**Granskning 29 oktober 2026:** README har jämförts med samtliga åtta route-handlers, auth-middleware, schemas, tjänster och Serverless-konfiguration. Syntaxkontroll av samtliga 20 JavaScript-moduler och Git diff-kontroll passerade efter flytten. Samtliga projektfiler, inklusive Git-historik och lokal konfiguration, hashverifierades vid flytten. Ingen ny API-deploy eller live-testning av backend ingår i detta dokumentationsarbete.

Det finns ingen incheckad automatiserad testsvit. `npm test` är en platshållare och ska inte tolkas som ett fungerande testkommando.

Kända begränsningar:

- Datumvalideringen kontrollerar format, inte att kalenderdatumet faktiskt finns.
- DynamoDB Query saknar paginering, även i tidskrockskontrollen.
- Tidskrockskontroll och skrivning är separata operationer och skyddar inte mot samtidiga bokningar.
- Refresh-tokenflöde saknas. Ny login krävs när tokenen går ut.
- DynamoDB-tabellerna provisioneras separat.
- Negativa ägarskapstester för varje skrivroute och live-test av ogiltig eller utgången token är inte fullständigt verifierade efter senaste backend-deploy.

[Tidigare arbetslogg, detaljerad konfiguration och rapporterade tester](docs/DEVELOPMENT_HISTORY.md).

## Lokal projektplacering

Frontend och backend ligger bredvid varandra som två separata Git-repon:

```text
active/
  Calendar/
  Calendar-Events-API/
```

Nästa utvecklingssteg är utökade backendtester och att hantera de dokumenterade begränsningarna. Kalenderns portfoliodemo kan användas separat under tiden.
