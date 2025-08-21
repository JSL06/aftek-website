@echo off
echo ========================================
echo AFTEK Storage Setup Script
echo ========================================
echo.

echo Step 1: Checking current storage status...
echo Running CHECK_STORAGE_STATUS.sql...
echo.

echo Step 2: Setting up storage bucket and policies...
echo Running SETUP_STORAGE_BUCKET.sql...
echo.

echo Step 3: Diagnosing RLS issues...
echo Running DIAGNOSE_RLS_ISSUE.sql...
echo.

echo Step 4: Fixing RLS policies for media_files (OPEN VERSION)...
echo Running FIX_MEDIA_RLS_OPEN.sql...
echo.

echo Step 5: If still having issues, disable RLS temporarily...
echo Running DISABLE_RLS_TEMPORARILY.sql...
echo.

echo Step 6: Fix media editing permissions...
echo Running FIX_MEDIA_EDIT_PERMISSIONS.sql...
echo.

echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Go to your Supabase Dashboard
echo 2. Navigate to SQL Editor
echo 3. Run CHECK_STORAGE_STATUS.sql first
echo 4. Then run SETUP_STORAGE_BUCKET.sql
echo 5. Then run DIAGNOSE_RLS_ISSUE.sql to see what's wrong
echo 6. Then run FIX_MEDIA_RLS_OPEN.sql
echo 7. If still failing, run DISABLE_RLS_TEMPORARILY.sql
echo 8. Finally run FIX_MEDIA_EDIT_PERMISSIONS.sql for editing
echo 9. Check the results for any errors
echo.
echo After running all scripts, try uploading and editing files
echo in the MediaManager to test if it works.
echo.
echo ========================================
pause
