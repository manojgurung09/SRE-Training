# env.tpl – BharatMart shared .env template
NODE_ENV=production
DEPLOYMENT_MODE=oci

# ===== DATABASE (SUPABASE) =====
DATABASE_TYPE=supabase
SUPABASE_URL=${supabase_url}
SUPABASE_ANON_KEY=${supabase_anon_key}
SUPABASE_SERVICE_ROLE_KEY=${supabase_service_role_key}

# ===== AUTH =====
AUTH_PROVIDER=supabase
JWT_SECRET=${jwt_secret}

# ===== SERVER =====
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://${lb_ip}
CORS_ORIGIN=*

# ===== WORKERS (OPTIONAL, DISABLED) =====
WORKER_MODE=none
QUEUE_REDIS_URL=

# ===== CACHE =====
CACHE_TYPE=memory

# ===== LOGGING =====
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_FILE=./logs/api.log

# ===== METRICS =====
ENABLE_METRICS=true

# ===== FRONTEND (VITE) =====
VITE_API_URL=http://${lb_ip}:3000
VITE_APP_NAME=BharatMart
VITE_SUPABASE_URL=${supabase_url}
VITE_SUPABASE_ANON_KEY=${supabase_anon_key}

# ===== ADMIN SEED =====
ADMIN_EMAIL=${admin_email}
ADMIN_PASSWORD=${admin_password}

# ===== OTEL =====
OTEL_SERVICE_NAME=bharatmart-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_TRACES_SAMPLER=always_on

# ===== CHAOS MODE =====
CHAOS_ENABLED=true
CHAOS_LATENCY_MS=800
