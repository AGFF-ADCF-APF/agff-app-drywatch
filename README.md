# AGFF DryControl - Git und Release Kurzanleitung

Diese Anleitung ist bewusst einfach gehalten. Ziel: sichere Entwicklung mit klaren Stufen.

## Was ist die Idee?

Wir trennen die Arbeit in drei Stufen:

- `develop` = Entwicklung
- `staging` = Test / Abnahme
- `main` = Produktiv

So kann man neue Funktionen testen, bevor sie live gehen.

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
