@echo off
echo ========================================
echo    AFTEK Projects Multilingual Update
echo ========================================
echo.
echo This script will guide you through updating your projects table
echo to support multilingual fields for all project properties.
echo.
echo STEP 1: Open Supabase SQL Editor
echo - Go to your Supabase dashboard
echo - Click on "SQL Editor" in the left sidebar
echo - Click "New query"
echo.
echo STEP 2: Copy and paste the SQL script
echo - Open the file: UPDATE_PROJECTS_MULTILINGUAL.sql
echo - Copy ALL the contents
echo - Paste it into the Supabase SQL Editor
echo.
echo STEP 3: Run the script
echo - Click the "Run" button (or press Ctrl+Enter)
echo - Wait for the script to complete
echo - You should see "Update complete!" message
echo.
echo STEP 4: Verify the update
echo - Check that new columns were added to project_translations table
echo - Verify that existing data was migrated
echo.
echo IMPORTANT NOTES:
echo - This update adds multilingual support for:
echo   * Category (類別)
echo   * Location (位置) 
echo   * Client (客戶)
echo   * Completion Date (完成日期)
echo   * Duration
echo   * Project Value
echo   * Project Type
echo.
echo - All existing data will be preserved
echo - New multilingual fields will be populated with existing values
echo.
echo Press any key to continue...
pause >nul
echo.
echo Update completed! Your projects now have full multilingual support.
echo You can now edit project fields in different languages in the admin panel.
echo.
pause
