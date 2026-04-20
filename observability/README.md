# Observability (Prometheus + Grafana + Loki + Promtail)

Opt-in overlay stack. Not launched by the default compose file.

## Start

```bash
# One-time: create the external network that the backend joins in the main compose
docker network create worktime_internal

# Launch app + observability together
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

## URLs

| Service    | URL                      | Notes                              |
|------------|--------------------------|------------------------------------|
| Grafana    | http://localhost:3001    | Host port 3001 (3000 is Next.js)   |
| Prometheus | http://localhost:9090    | Query UI + targets page            |
| Loki       | http://localhost:3100    | API only                           |
| Backend    | http://backend:4000/api/metrics | Scraped by Prometheus       |

## Default credentials

Grafana: `admin` / value of `GF_SECURITY_ADMIN_PASSWORD` (default `admin` — change in `.env`).

## Adding dashboards

1. Drop a JSON file into `observability/grafana/dashboards/`.
2. Grafana reprovisions every 30s (see `provisioning/dashboards/dashboards.yml`).
3. To export from the UI: Dashboard > Share > Export > Save to file, then commit it.

## Log shipping

Promtail scrapes only containers labelled `logging=promtail`. Add the label to any service in the main compose to stream its stdout/stderr into Loki.
