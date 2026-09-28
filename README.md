# BottleTrack Web Application

Frontend Web Application of **BottleTrack**, the bottled beverage transport tracking platform by **CodeCrafters**. It lets beverage distributors manage their fleet, plan transport operations, monitor cargo with IoT sensors and report incidents with evidence.

## Tech stack

- Vue 3 with the Composition API and Vite
- PrimeVue 4 with the Material preset, PrimeFlex and PrimeIcons, all under the MIT license
- Vue Router, Pinia, Vue I18n and Axios
- json-server as fake API until the Web Services are available

## Architecture

The source code is organized by bounded context, following Domain-Driven Design. Each context contains four layers:

| Layer | Content |
| :---- | :------ |
| `domain` | Entities, value objects and commands written as plain JavaScript classes. |
| `application` | Pinia stores that coordinate the use cases of the context. |
| `infrastructure` | API gateways built on the shared `BaseApi`, assemblers, guards and interceptors. |
| `presentation` | Views, components and the route module of the context. |

## Bounded contexts

The application follows the five bounded contexts defined in the project report. Each one lives in its own folder under `src/` and has an owner in the team:

| Folder | Bounded context | Owner |
| :----- | :-------------- | :---- |
| `src/iam` | Identity and Access Management | Crispin Valdivia, Angel Gabriel |
| `src/fleet` | Fleet Management | Huapaya Buitron, Ariana Alheli |
| `src/operations` | Operations and Routes | Cumba Rengifo, Leonardo Raul |
| `src/monitoring` | IoT Monitoring | Palacin Lazo, Gerardo Valentin |
| `src/incidents` | Incident Management | Pezo Castilla, Maria Jose |

`src/shared` holds the HTTP client base, the application shell and the views that do not belong to a single context.

## Adding a bounded context

1. Create `src/<context>/` with the four layers. Use `src/shared/infrastructure/base-api.js` and `base-endpoint.js` for every HTTP call, and register the endpoint path in `.env.development`.
2. Export the routes of the context from `src/<context>/presentation/<context>-routes.js` and register them in `src/router.js`.
3. Add every text to `src/locales/en.json` and `src/locales/es.json` under a key named after the context.
4. Use the PrimeVue components registered in `src/main.js` with the `pv-` prefix, and the design tokens of `src/tokens.css` instead of fixed values.
5. Never read another context's collections directly from a view: go through the infrastructure layer of your own context.

The side navigation shows an item only when its route exists, so each item appears as soon as its route is registered. Use these route names:

| Route name | Path | Role | Bounded context |
| :--------- | :--- | :--- | :-------------- |
| `profile` | `/iam/profile` | All roles | Identity and Access Management |
| `users` | `/iam/users` | Administrator | Identity and Access Management |
| `company` | `/iam/company` | Administrator | Identity and Access Management |
| `vehicles` | `/fleet/vehicles` | Administrator, Fleet Supervisor | Fleet Management |
| `drivers` | `/fleet/drivers` | Administrator, Fleet Supervisor | Fleet Management |
| `operations` | `/operations` | Fleet Supervisor | Operations and Routes |
| `history` | `/operations/history` | Fleet Supervisor | Operations and Routes |
| `tracking` | `/tracking` | Delivery Point Owner | Operations and Routes |
| `monitoring` | `/monitoring` | Fleet Supervisor | IoT Monitoring |
| `devices` | `/monitoring/devices` | Administrator | IoT Monitoring |
| `incidents` | `/incidents` | Fleet Supervisor | Incident Management |
| `analytics` | `/analytics` | Administrator, Fleet Supervisor | Incident Management |

The paths `/analytics`, `/monitoring` and `/tracking` are the targets of the segment calls to action of the Landing Page.

## Getting started

```bash
npm install
npm run fake-api
npm run dev
```

Demo users of the fake API, all with the password `BottleTrack2026`:

| Email | Role |
| :---- | :--- |
| `lucia.paredes@sanmarino.pe` | Administrator |
| `arturo.jimenez@sanmarino.pe` | Fleet Supervisor |
| `carmen.salazar@bodegacarmen.pe` | Delivery Point Owner |
| `jorge.ramirez@sanmarino.pe` | Fleet Supervisor, inactive |

The fake API runs on `http://localhost:3000/api/v1` and the application on `http://localhost:5173`.

## Workflow

GitFlow with `main`, `develop` and `feature/<kebab-case>` branches, Conventional Commits and Semantic Versioning.
