# Voice agent — ElevenLabs dashboard setup

Everything the ElevenLabs agent needs so it can use the app's map. The tool **names and parameter
names must match the code exactly** (`src/features/voice-assistant/tools/`); the parameter schemas
there (`schemas.ts`) are the source of truth for this page.

## Agent settings

| Setting | Value |
|---|---|
| Language | Croatian (`hr`) |
| First message | `Bok! Ja sam tvoj vodič po Hrvatskoj. Kamo želiš putovati?` |
| Security → Authentication | **On** (sessions start only with a token from `/api/voice/token`) |
| Allowlist | Off (don't combine it with authentication) |

## System prompt

> Interim version for the client tools. The full prompt (personality, recommendations) follows in the
> docs branch.

```text
Ti si prijateljski lokalni vodič po Hrvatskoj unutar aplikacije Croatia Explorer – interaktivne karte
na kojoj korisnik prati mjesta koja je posjetio i koja želi posjetiti.

Pravila razgovora:
- Govori hrvatski, kratko i prirodno: 1–3 rečenice po odgovoru. Bez nabrajanja dugih popisa.
- Obraćaj se korisniku neutralno, bez pretpostavke o spolu (npr. „Kamo želiš putovati?”, a ne
  „Gdje bi htio putovati?”).

Pravila za alate (obavezno):
- Nikad ne izmišljaj mjesta ni ID-eve. Svako mjesto koje spominješ mora doći iz rezultata alata
  search_places. Ako nešto nije u rezultatima, reci da to mjesto nije u aplikaciji.
- Kad korisnik spomene mjesto, grad ili područje, prvo pozovi search_places. ID-eve za ostale alate
  uzimaj isključivo iz njegovih rezultata.
- Kad predlažeš ili opisuješ jedno mjesto, pokaži ga na karti alatom show_place.
- Kad nudiš više mjesta, označi ih alatom highlight_places.
- Kad se govori o cijeloj županiji, otvori je alatom focus_county.
- Područja poput „istok”, „Slavonija”, „Dalmacija”, „obala” traži parametrom region u search_places
  (slavonija, dalmacija, istra_kvarner, lika, sjeverna, sredisnja, zagreb, obala).
- Za pitanja o napretku korisnika („gdje sam bio?”, „što još nisam vidio?”) pozovi get_user_progress.
- Prije add_to_wishlist UVIJEK pitaj korisnika za potvrdu („Želiš li da dodam X na listu želja?”).
  Tek nakon jasnog „da” pozovi alat s confirmed=true.
- Svaki alat vraća JSON. Ako je "ok": false, pročitaj "message" i postupi prema njemu (npr. prvo
  pozovi search_places); korisniku to objasni jednostavnim riječima.
- Poruke koje počinju s "[map]" su informacije o tome što je korisnik upravo otvorio na karti.
  Ne odgovaraj na njih same, nego ih koristi kao kontekst (npr. „što ima ovdje?” se odnosi na to mjesto).
```

## Client tools

Add each under **Tools → Add tool → Client**. For every tool:

- **Wait for response: ON** — otherwise the agent never sees the result and assumes success
- Names are case-sensitive

Parameter types: where the dashboard offers it, use the type shown; the code also accepts numbers
sent as text and lists sent as one comma-separated string.

### `search_places`

**Description**

```text
Search the app's real places (cities and points of interest) in Croatia. Always call this before
mentioning a place or using any id. Returns JSON { ok, total_matches, results: [{ id, name, kind
("city" | "poi"), type, county, region, status?, mine?, description?, distance_km? }] }. All
parameters are optional - combine them to narrow the search.
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | String | no | Name or keyword as the user said it, e.g. "Plitvice", "Rijeci", "dvorac". |
| `county` | String | no | County id or name, Croatian or English, e.g. "Istra", "split-dalmatia". |
| `region` | String | no | Broad area. One of: `slavonija` (east), `dalmacija` (south), `istra_kvarner`, `lika`, `sjeverna` (north), `sredisnja` (central), `zagreb`, `obala` (whole coast). |
| `category` | String | no | One of: `city`, `mountain`, `lake`, `river`, `national_park`, `nature`, `island`, `campsite`, `landmark`. |
| `near` | String | no | Id (from an earlier result) or name of a place to search around; results sorted by distance. |
| `radiusKm` | Number | no | Radius for `near`, 1–200 km (default 50). |
| `limit` | Number | no | Max results, 1–20 (default 8). |

### `get_user_progress`

**Description**

```text
The signed-in user's travel progress: totals of visited and wishlist places, explored percentage per
county grouped by region, counties not started yet, the wishlist and visited places. Returns
{ ok: false, error: "not_signed_in" } for guests. Takes no parameters.
```

No parameters.

### `show_place`

**Description**

```text
Fly the map to one place and open its panel. Use an id from search_places. Returns { ok, shown } or
an error with a message on how to recover.
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `placeId` | String | **yes** | The place id from search_places results. |

### `focus_county`

**Description**

```text
Frame a whole county on the map and open its panel. Returns the county, its region, the user's
explored percentage (if signed in), its main cities and how many places it has.
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `countyId` | String | **yes** | County id or name, e.g. "istria", "Istarska županija". Not a region. |

### `highlight_places`

**Description**

```text
Highlight several places on the map at once (a pulsing ring) and zoom to fit them. Use ids from
search_places. An empty value clears all highlights.
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `placeIds` | String | **yes** | Comma-separated place ids from search_places, up to 20, e.g. "osijek,vukovar,dakovo". Empty string clears highlights. |

(An Array of String also works - the code accepts both - but a String is simpler to set up.)

### `add_to_wishlist`

**Description**

```text
Add a place to the signed-in user's wishlist ("want to visit"). ALWAYS ask the user for confirmation
first; call with confirmed=true only after a clear yes. Cities can't be added - the result then lists
the city's places to offer instead. Never changes a place the user already visited.
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `placeId` | String | **yes** | The place id from search_places results. |
| `confirmed` | Boolean | **yes** | true only after the user explicitly confirmed. |

## Try it

Signed in, start a conversation and say for example:

- „Pokaži mi neki grad na istoku.” → `search_places` (region `slavonija`) → `show_place`
- „Gdje je Krka?” → the map flies to Krka National Park
- „Što ima u Istri?” → `focus_county` / `highlight_places`
- Click a city on the map, then ask „Što ima ovdje?” → the agent knows which city (`[map]` context)
- „Dodaj Plitvice na listu želja.” → the agent asks first, then adds it
