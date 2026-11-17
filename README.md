# AGFF DryControl - Git und Release Kurzanleitung

Diese Anleitung ist bewusst einfach gehalten. Ziel: sichere Entwicklung mit klaren Stufen.

## Was ist die Idee?

Wir trennen die Arbeit in drei Stufen:

- `develop` = Entwicklung
- `staging` = Test / Abnahme
- `main` = Produktiv

So kann man neue Funktionen testen, bevor sie live gehen.

## Docker-Compose und Sicherheit

Ja, `docker-compose.yml` soll in Git bleiben.

Wichtig:

- Infrastruktur-Definition in Git: JA
- Secrets (Passwörter, API-Keys, Tokens) in Git: NEIN

Deshalb:

- Nutze `.env`-Dateien pro Umgebung (`deploy/*.env`), diese sind lokal.
- Nur Beispiel-Dateien (`*.env.example`) liegen im Repo.

## Branch-Regeln (einfach)

- Neue Aufgabe: Branch von `develop`, z. B. `feature/suche-info-wissen`
- Fertig entwickelt: Merge nach `develop`
- Für Test freigeben: Merge `develop` nach `staging`
- Für Live freigeben: Merge `staging` nach `main`
- Nach jedem Live-Release Tag setzen, z. B. `v2026.05.01`

## VS Code: Alltag ohne Terminal-Stress

1. Source-Control öffnen (linkes Git-Symbol).
2. Oben Branch wechseln oder neuen Branch erstellen.
3. Geänderte Dateien prüfen und committen.
4. Für Freigaben Pull Request / Merge zwischen den Branches machen.
5. Vor Live-Deploy immer prüfen: Du bist auf `main`.

## Erstes Setup (einmalig)

Im Projektordner ausführen:

```bash
git init -b main
git add .
git commit -m "Initial commit"
git branch develop
git branch staging
```

Optional Remote verbinden:

```bash
git remote add origin <GIT_URL>
git push -u origin main
git push -u origin develop
git push -u origin staging
```

## Standardablauf pro Änderung

```bash
git switch develop
git pull
git switch -c feature/<name>
# ... arbeiten ...
git add .
git commit -m "Feature: <kurz>"
git push -u origin feature/<name>
```

Danach Merge per Pull Request:

- `feature/*` -> `develop`
- `develop` -> `staging`
- `staging` -> `main`

## Deployment pro Stufe

Aktuell wird in dieser App per Docker Compose deployed:

```bash
docker compose up -d --build
```

Empfehlung:

- Test-URL nur von `staging` deployen
- Produktiv-URL nur von `main` deployen

### Parallel auf einem Server deployen

Dateien im Repo:

- `deploy/main.env.example`
- `deploy/staging.env.example`
- `deploy/develop.env.example`
- `tools/deploy_stack.sh`

Einmalig vorbereiten:

```bash
cp deploy/main.env.example deploy/main.env
cp deploy/staging.env.example deploy/staging.env
cp deploy/develop.env.example deploy/develop.env
```

Deploy je Stufe:

```bash
./tools/deploy_stack.sh main
./tools/deploy_stack.sh staging
./tools/deploy_stack.sh develop
```

Die Stufen laufen parallel, weil jede Stufe eigene Werte hat:

- eigener Containername
- eigener Traefik-Routername
- eigener URL-Pfad (`/drywatch`, `/drywatch-staging`, `/drywatch-dev`)

Automatisierung ist vorbereitet:

- `.github/workflows/branch-flow-guard.yml`
- `.github/workflows/deploy-by-branch.yml`

Die Deploy-Workflows laufen auf `self-hosted` Runnern.

## GitHub Branch-Schutz (einmalig in GitHub klicken)

In GitHub beim Repo:

1. `Settings` -> `Branches` -> `Add branch protection rule`
2. Regel für `main` erstellen:
	- Require a pull request before merging = EIN
	- Require status checks to pass = EIN
	- Statuscheck `Branch Flow Guard / validate-flow` auswählen
	- Optional: Include administrators = EIN
3. Regel für `staging` genauso erstellen
4. Regel für `develop` genauso erstellen

Damit kann niemand direkt unsauber in die Ziel-Branches mergen.

## Self-Hosted Runner (für Auto-Deploy)

Kurz erklärt: Der Runner ist ein kleiner Dienst auf deinem Server, der GitHub-Workflows lokal ausführt.

Grobe Schritte:

1. GitHub: `Settings` -> `Actions` -> `Runners` -> `New self-hosted runner`
2. Linux-Befehle von GitHub auf dem Zielserver ausführen
3. Runner als Service installieren/starten
4. Danach deployt GitHub automatisch:
	- Push auf `staging` -> Staging-Deploy
	- Push auf `main` -> Produktiv-Deploy

## Rollback in 1 Minute

Wenn ein Release Probleme macht:

```bash
git switch main
git log --oneline
git checkout <TAG_ODER_COMMIT>
docker compose up -d --build
```

Hinweis: Für saubere Team-Arbeit besser statt `checkout` einen Hotfix- oder Revert-Commit auf `main` erstellen.

## Mini-Checkliste vor Produktiv

- Richtiger Branch (`main`)
- Letzte Änderungen auf `staging` getestet
- Tag geplant/gesetzt
- Backup vorhanden (DB / wichtige Dateien)
- Deploy durchgeführt und Live-Check gemacht


## Lizenz

Code: © 2026 AGFF – Arbeitsgemeinschaft zur Förderung des Futterbaues, lizenziert unter der EUPL-1.2 (Datei `LICENSE`; amtliche
Fassungen auch auf Deutsch, Französisch und Italienisch: https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12). Nicht unter
die Lizenz fallen die Inhalte (Merkblätter, Zeichnungen, Fotos, Tabellen); die Rechte liegen bei der jeweiligen Quelle, meist bei der
AGFF. Die Lizenz wird zentral gepflegt in `heimserver-werkzeuge/lizenz`.
