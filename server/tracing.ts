import dotenv from 'dotenv';
dotenv.config();

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

console.log('Tracing ENV =', process.env.OTEL_EXPORTER_OTLP_ENDPOINT); // ✅ DEBUG LINE

const serviceName = process.env.OTEL_SERVICE_NAME || 'bharatmart-backend';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({
      url: otlpEndpoint,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    sdk.start();
    console.log(`🔍 OpenTelemetry tracing initialized: ${serviceName} → ${otlpEndpoint}`);
  } catch (err) {
    console.error('❌ OpenTelemetry init failed:', err);
  }
}
