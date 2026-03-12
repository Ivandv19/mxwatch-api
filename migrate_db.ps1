$ErrorActionPreference = "Stop"

$env:PGPASSWORD="Getter19`$mx19`$"

Write-Host "1. Extracting data from original DB (postgres)..."
pg_dump -U postgres -h 127.0.0.1 -p 5432 --clean --if-exists --no-owner --no-privileges postgres > dump_local.sql

Write-Host "2. Injecting exact clone into dedicated DB (mxwatch_db)..."
psql -U postgres -h 127.0.0.1 -p 5432 -d mxwatch_db -f dump_local.sql > $null 2>&1

Write-Host "3. Database migration completed successfully!"
