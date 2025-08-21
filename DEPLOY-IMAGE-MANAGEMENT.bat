@echo off
echo ========================================
echo AFTEK Image Management System Deployer
echo ========================================
echo.

echo This script will deploy the image management system to your Supabase database.
echo Make sure you have the following environment variables set:
echo - VITE_SUPABASE_URL
echo - VITE_SUPABASE_ANON_KEY
echo - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
echo.

echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Deploying image management system...
echo.

REM Check if psql is available
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: psql is not installed or not in PATH
    echo Please install PostgreSQL client tools or use Supabase dashboard
    echo.
    echo You can also run the SQL script manually in your Supabase dashboard:
    echo 1. Go to https://supabase.com/dashboard
    echo 2. Select your project
    echo 3. Go to SQL Editor
    echo 4. Copy and paste the contents of CREATE_IMAGE_MANAGEMENT_SYSTEM.sql
    echo 5. Click Run
    echo.
    pause
    exit /b 1
)

echo Using psql to deploy...
echo.

REM Set your Supabase database URL (replace with your actual connection string)
set SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.txjhhwootljiqavnnghm.supabase.co:5432/postgres

echo Attempting to connect to Supabase database...
echo.

REM Run the SQL script
psql "%SUPABASE_DB_URL%" -f "CREATE_IMAGE_MANAGEMENT_SYSTEM.sql"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Image management system deployed!
    echo ========================================
    echo.
    echo The following has been set up:
    echo - Media files table with RLS policies
    echo - Page backgrounds table for each page
    echo - Storage monitoring and quota management
    echo - Media categories and organization
    echo - Views for easy data access
    echo.
    echo Next steps:
    echo 1. Update your Supabase types (run: npm run supabase:types)
    echo 2. Restart your development server
    echo 3. Test the new media management features
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Deployment failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. Your database connection string
    echo 2. Your Supabase credentials
    echo 3. Network connectivity
    echo.
    echo Alternative: Use the Supabase dashboard to run the SQL manually
    echo.
)

echo Press any key to exit...
pause >nul
