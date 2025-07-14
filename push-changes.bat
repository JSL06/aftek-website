<<<<<<< HEAD
@echo off
echo 🚀 Pushing changes to GitHub...

echo.
echo 📝 Adding all changes...
git add .

echo.
echo 💬 Enter a commit message (or press Enter for default):
set /p commit_message=

if "%commit_message%"=="" (
    set commit_message=Updated website content
)

echo.
echo ✅ Committing changes with message: "%commit_message%"
git commit -m "%commit_message%"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Changes pushed successfully!
echo 🌐 Your website will update in 2-3 minutes at:
echo https://YOUR_USERNAME.github.io/aftek-website/
echo.
=======
@echo off
echo 🚀 Pushing changes to GitHub...

echo.
echo 📝 Adding all changes...
git add .

echo.
echo 💬 Enter a commit message (or press Enter for default):
set /p commit_message=

if "%commit_message%"=="" (
    set commit_message=Updated website content
)

echo.
echo ✅ Committing changes with message: "%commit_message%"
git commit -m "%commit_message%"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Changes pushed successfully!
echo 🌐 Your website will update in 2-3 minutes at:
echo https://YOUR_USERNAME.github.io/aftek-website/
echo.
>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
pause 