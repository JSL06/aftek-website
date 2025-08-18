@echo off
echo ========================================
echo    AFTEK Guide System Setup
echo ========================================
echo.
echo This will help you set up the database tables for the interactive guide system.
echo.
echo Steps:
echo 1. Go to your Supabase project dashboard
echo 2. Navigate to the SQL Editor
echo 3. Copy and paste the contents of 'setup-guide-system.sql'
echo 4. Run the SQL script
echo 5. The admin page will be available at /admin/guide
echo.
echo Press any key to open the SQL file...
pause >nul
start notepad setup-guide-system.sql
echo.
echo After running the SQL script in Supabase:
echo 1. The guide_facilities table will be created with default building types
echo 2. The guide_hotspots table will be created with sample hotspots
echo 3. Row Level Security policies will be configured
echo 4. You can then use the Guide Manager admin page to customize everything
echo.
echo Press any key to exit...
pause >nul
