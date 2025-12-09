# Observability Issues

Troubleshooting guide for observability-related problems.

## Metrics Issues

### Metrics Not Appearing

**Symptom:** `/metrics` endpoint empty or missing metrics

**Solutions:**
1. **Check Metrics Endpoint:**
   ```bash
   curl http://localhost:3000/metrics
   ```

2. **Check Metric Registration:**
   - Verify metrics are registered
   - Check metric definitions
   - Review metric initialization

3. **Check Prometheus Scraping:**
   - Verify Prometheus configuration
   - Check scrape job targets
   - Review scrape intervals

**Source:** Metrics endpoint in `server/app.ts` lines 39-42.

### Prometheus Not Scraping

**Symptom:** Prometheus not collecting metrics

**Solutions:**
1. **Check Target Status:**
   - View targets in Prometheus UI
   - Check target health
   - Review error messages

2. **Check Network:**
   - Verify network connectivity
   - Check firewall rules
   - Test metrics endpoint accessibility

3. **Check Configuration:**
   - Review `prometheus.yml`
   - Verify scrape job configuration
   - Check target URLs

**Source:** Prometheus configuration in `deployment/prometheus.yml`.

## Logging Issues

### Logs Not Generating

**Symptom:** No log files created

**Solutions:**
1. **Check Log Configuration:**
   - Verify `LOG_FILE` path
   - Check directory permissions
   - Review log level setting

2. **Check Log Directory:**
   - Ensure `logs/` directory exists
   - Verify write permissions
   - Check disk space

3. **Check Logger Initialization:**
   - Verify logger is initialized
   - Check logger configuration
   - Review logger setup

**Source:** Logger configuration in `server/config/logger.ts` lines 13-15.

### Logs Not in JSON Format

**Symptom:** Logs not structured JSON

**Solutions:**
1. **Check Log Format:**
   - Verify JSON format is configured
   - Review logger format settings
   - Check Winston configuration

2. **Check Log Level:**
   - Verify `LOG_LEVEL` setting
   - Check log level filtering
   - Review log level configuration

**Source:** Logger format in `server/config/logger.ts`.

## Tracing Issues

### Traces Not Appearing

**Symptom:** No traces in collector

**Solutions:**
1. **Check OTLP Endpoint:**
   - Verify `OTEL_EXPORTER_OTLP_ENDPOINT` is set
   - Check endpoint URL is correct
   - Test endpoint accessibility

2. **Check Service Name:**
   - Verify `OTEL_SERVICE_NAME` is set
   - Check service name format
   - Review tracing configuration

3. **Check Collector:**
   - Verify OTLP collector is running
   - Check collector configuration
   - Review collector logs

**Source:** Tracing configuration in `server/tracing.ts` lines 13, 20-22.

### Tracing Not Initialized

**Symptom:** Tracing not working

**Solutions:**
1. **Check Initialization:**
   - Verify tracing is imported
   - Check initialization order
   - Review tracing setup

2. **Check Dependencies:**
   - Verify OpenTelemetry packages
   - Check package versions
   - Review dependency installation

**Source:** Tracing initialization in `server/tracing.ts` lines 15-32.

## Grafana Issues

### Dashboards Not Loading

**Symptom:** Grafana dashboards empty or errors

**Solutions:**
1. **Check Data Source:**
   - Verify Prometheus data source
   - Test data source connection
   - Check data source configuration

2. **Check Queries:**
   - Verify PromQL queries are correct
   - Check metric names
   - Review query syntax

3. **Check Time Range:**
   - Verify time range selection
   - Check data availability
   - Review time range settings

**Source:** Grafana dashboard configuration.

## Alert Issues

### Alerts Not Firing

**Symptom:** Alerts not triggering

**Solutions:**
1. **Check Alert Rules:**
   - Verify alert rule syntax
   - Check alert conditions
   - Review alert thresholds

2. **Check Alertmanager:**
   - Verify Alertmanager is running
   - Check Alertmanager configuration
   - Review notification channels

3. **Check Metrics:**
   - Verify metrics exist
   - Check metric values
   - Review alert queries

**Source:** Alert configuration.

## Next Steps

- [Troubleshooting Overview](01-troubleshooting-overview.md) - Troubleshooting guide
- [Observability Overview](../06-observability/01-observability-overview.md) - Observability guide
- [Common Issues](02-common-issues.md) - Common problems

