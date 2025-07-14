# 🚀 GitHub Pages Deployment Guide

Follow these steps to host your Aftek website on GitHub Pages:

## 📋 Prerequisites

1. **GitHub Account**: Make sure you have a GitHub account
2. **Git**: Install Git on your computer
3. **Node.js**: Make sure Node.js is installed (you already have this)

## 🔧 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details**:
   - Repository name: `aftek-website` (or any name you prefer)
   - Description: `Aftek Construction Company Website`
   - **Make it Public** (required for free GitHub Pages)
   - **Don't** initialize with README (we already have one)
5. **Click "Create repository"**

### Step 2: Upload Your Project

**Option A: Using GitHub Desktop (Recommended for beginners)**

1. **Download GitHub Desktop** from [desktop.github.com](https://desktop.github.com/)
2. **Install and sign in** with your GitHub account
3. **Click "Clone a repository"**
4. **Select your new repository** and choose a local path
5. **Copy all your project files** into the cloned folder
6. **Commit and push** your changes

**Option B: Using Command Line**

1. **Open Command Prompt** in your project folder
2. **Run these commands**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/aftek-website.git
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click "Settings"** tab
3. **Scroll down to "Pages"** in the left sidebar
4. **Under "Source"**, select **"Deploy from a branch"**
5. **Choose "main"** branch and **"/ (root)"** folder
6. **Click "Save"**

### Step 4: Build and Deploy

1. **Go to "Actions"** tab in your repository
2. **You should see a workflow running** (if not, make a small change and push it)
3. **Wait for the build to complete** (green checkmark)
4. **Your website will be live** at: `https://YOUR_USERNAME.github.io/aftek-website/`

## 🔄 Updating Your Website

### Automatic Updates (Recommended)

1. **Make changes** to your local files
2. **Commit and push** to GitHub
3. **GitHub Actions will automatically** build and deploy your changes
4. **Wait 2-3 minutes** for the new version to go live

### Manual Updates

1. **Build your project locally**:
   ```bash
   npm run build
   ```
2. **Upload the contents** of the `dist/` folder to your web server

## 🌐 Custom Domain (Optional)

If you want to use your own domain (e.g., `www.aftek.com`):

1. **Buy a domain** from a domain registrar
2. **Go to repository Settings > Pages**
3. **Add your domain** in the "Custom domain" section
4. **Update your DNS settings** as instructed by GitHub

## 📞 Troubleshooting

### Common Issues:

1. **Build fails**: Check the Actions tab for error messages
2. **Website not loading**: Make sure the repository is public
3. **Changes not appearing**: Wait 2-3 minutes for deployment
4. **Translation editor not working**: Make sure to run it locally

### Need Help?

- **GitHub Pages Documentation**: [pages.github.com](https://pages.github.com/)
- **GitHub Support**: [support.github.com](https://support.github.com/)

## ✅ Success Checklist

- [ ] Repository created and public
- [ ] All files uploaded to GitHub
- [ ] GitHub Pages enabled
- [ ] GitHub Actions workflow running
- [ ] Website accessible at the provided URL
- [ ] All pages and features working correctly
- [ ] Mobile responsiveness tested

---

**🎉 Congratulations! Your Aftek website is now live and shareable!** 