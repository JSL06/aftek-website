@echo off
echo ========================================
echo AFTEK Database Setup Script
echo ========================================
echo.

echo Checking if Supabase CLI is available...
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Please install it first.
    echo Visit: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

echo Setting up database tables...
echo.

echo 1. Running database setup script...
supabase db reset --linked

echo.
echo 2. Applying product translations table setup...
supabase db push

echo.
echo 3. Running custom setup script...
psql "$(supabase db get-connection-string)" -f SETUP_PRODUCT_TRANSLATIONS_TABLES.sql

echo.
echo 4. Verifying table structure...
psql "$(supabase db get-connection-string)" -f CHECK_DATABASE_STRUCTURE.sql

echo.
echo ========================================
echo Database setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Test the admin panel
echo 2. Try saving a product name
echo 3. Use the debug buttons to verify data persistence
echo.
pause
