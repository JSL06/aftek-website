@echo off
echo ====================================================
echo CHECK DATABASE STATUS - AFTEK WEBSITE
echo ====================================================
echo.
echo This will check what's actually in your database
echo to see why the 400 errors are still happening.
echo.
echo ====================================================
echo STEP 1: Open Supabase Dashboard
echo ====================================================
echo 1. Go to your Supabase project dashboard
echo 2. Click on "SQL Editor" in the left sidebar
echo 3. Click "New Query"
echo.
echo ====================================================
echo STEP 2: Copy and Paste the Diagnostic Script
echo ====================================================
echo 1. Open the file: CHECK_DATABASE_STATUS.sql
echo 2. Copy ALL the content from that file
echo 3. Paste it into the Supabase SQL Editor
echo.
echo ====================================================
echo STEP 3: Run the Diagnostic Script
echo ====================================================
echo 1. Click the "Run" button (or press Ctrl+Enter)
echo 2. Look at the results in the right panel
echo 3. Check the "Messages" tab for detailed info
echo.
echo ====================================================
echo STEP 4: What to Look For
echo ====================================================
echo - Tables should show "EXISTS" not "MISSING"
echo - Categories should show "EXISTS" not "MISSING"
echo - RLS should show "ENABLED" not "DISABLED"
echo - Policies should show a number > 0
echo.
echo ====================================================
echo STEP 5: Tell Me the Results
echo ====================================================
echo Copy and paste the results here so I can see:
echo - What tables exist/missing
echo - What categories exist/missing
echo - RLS status
echo - Policy counts
echo.
echo ====================================================
echo WHY THIS IS IMPORTANT
echo ====================================================
echo The 400 errors mean your website can't find the data
echo This diagnostic will show us exactly what's missing
echo so we can fix it properly.
echo.
echo ====================================================
pause
