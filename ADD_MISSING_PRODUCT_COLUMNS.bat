@echo off
echo ========================================
echo AFTEK Website - Add Missing Product Columns
echo ========================================
echo.
echo This script will add the missing columns to the products table:
echo - projects_used (TEXT[] array for project IDs)
echo - specifications (JSONB for multilingual technical specs)
echo.
echo Please follow these steps:
echo.
echo 1. Open your Supabase dashboard
echo 2. Go to the SQL Editor
echo 3. Copy the contents of ADD_MISSING_PRODUCT_COLUMNS.sql
echo 4. Paste it into the SQL Editor
echo 5. Click "Run" to execute the script
echo.
echo The script will:
echo - Add the missing columns if they don't exist
echo - Set default values for existing records
echo - Verify the columns were added successfully
echo.
echo After running the script, you should see:
echo - "Script completed successfully! New columns added to products table."
echo - A list of the new columns with their data types
echo - Sample data showing the new columns
echo.
echo Press any key to continue...
pause >nul
echo.
echo If you encounter any issues:
echo - Check that you're connected to the correct Supabase project
echo - Ensure you have admin privileges
echo - Check the console for any error messages
echo.
echo Once the script completes successfully, you can:
echo - Return to the admin panel
echo - Try editing product related projects/products again
echo - The save operation should now work without errors
echo.
echo Press any key to exit...
pause >nul
