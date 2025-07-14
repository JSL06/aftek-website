@echo off
echo 🚀 Preparing project for GitHub Pages deployment...

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔨 Building the project...
call npm run build

echo.
echo 📁 Creating GitHub Pages files...

REM Create a simple index.html for the root if it doesn't exist
if not exist "index.html" (
    echo ^<!DOCTYPE html^>^
    ^<html^>^
    ^<head^>^
        ^<meta http-equiv="refresh" content="0; url=./dist/index.html"^>^
    ^</head^>^
    ^<body^>^
        ^<p^>Redirecting to the website...^</p^>^
    ^</body^>^
    ^</html^> > index.html
)

echo.
echo ✅ Project is ready for GitHub!
echo.
echo 📋 Next steps:
echo 1. Create a GitHub repository
echo 2. Upload your project files to GitHub
echo 3. Go to repository Settings ^> Pages
echo 4. Set Source to "Deploy from a branch"
echo 5. Select "main" branch and "/ (root)" folder
echo 6. Click Save
echo.
echo 🌐 Your website will be available at:
echo https://[your-username].github.io/[repository-name]/
echo.
pause 