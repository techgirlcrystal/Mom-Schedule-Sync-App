# GitHub Setup Guide for Mom's Daily Planner

## Steps to Upload to GitHub

### 1. Create a New Repository on GitHub
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it something like `moms-daily-planner` or `christian-mom-scheduler`
5. Add description: "A personalized React-based daily spiritual companion for Christian mothers"
6. Choose "Public" or "Private" based on your preference
7. Don't initialize with README (we already have one)
8. Click "Create repository"

### 2. Download Your Project Files
Since you're on Replit, you need to download all your project files:
1. In Replit, click the three dots menu
2. Select "Download as zip"
3. Extract the zip file on your computer

### 3. Initialize Git Repository Locally
Open terminal/command prompt in your extracted project folder:

```bash
git init
git add .
git commit -m "Initial commit: Mom's Daily Planner with Go High Level integration"
```

### 4. Connect to GitHub and Push
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 5. Set Up Environment Variables
Your `.env.example` file is included. Users will need to:
1. Copy `.env.example` to `.env`
2. Fill in their actual API keys and database credentials

## What's Protected
The `.gitignore` file prevents these sensitive items from being uploaded:
- Environment variables (.env files)
- API keys and secrets
- Database files
- Attached screenshots
- Node modules
- Build files

## Repository Features
Your GitHub repository will include:
- Complete source code
- Comprehensive README.md
- Go High Level setup guide
- Environment variables template
- Embed code examples
- Documentation for developers

## Alternative: Use GitHub Desktop
If you prefer a visual interface:
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. File → Add Local Repository
4. Select your extracted project folder
5. Publish to GitHub

## Repository URL
Once uploaded, your repository will be available at:
`https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`

## Next Steps After Upload
1. Add a license file (MIT recommended for open source)
2. Create issues for any known bugs or feature requests
3. Add GitHub Pages for project documentation (optional)
4. Set up GitHub Actions for automated deployment (advanced)

Your Mom's Daily Planner will be safely stored on GitHub and available for collaboration or backup.