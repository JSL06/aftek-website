# Aftek Construction Website

A modern, multilingual website for Aftek Construction Company showcasing construction materials, solutions, and services across the Asia-Pacific region.

## 🌐 Live Website

Visit the live website: [https://your-username.github.io/aftek-website/](https://your-username.github.io/aftek-website/)

## 🚀 Features

- **Multilingual Support**: English, Japanese, Korean, Thai, Vietnamese, Chinese (Simplified & Traditional)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Admin Panel**: Easy content management system for non-technical users
- **Product Showcase**: Comprehensive product catalog with filtering
- **Project Portfolio**: Case studies and past projects
- **Contact Management**: Multiple contact methods and forms
- **AI Chatbot**: Interactive customer support

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (Database & Authentication)
- **Deployment**: GitHub Pages
- **Translation**: Custom translation system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/aftek-website.git
   cd aftek-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Content Management

### Translation Editor
Run the local translation editor to manage website content:
```bash
node translation-editor.js
```
Then visit `http://localhost:3000` to edit translations.

### Admin Panel
Access the admin panel at `/admin` to manage:
- Website text content
- Product information
- Project showcases
- Articles and news

## 📁 Project Structure

```
aftek-website/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── locales/            # Translation files
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── dist/                   # Build output
└── .github/               # GitHub Actions
```

## 🌍 Languages Supported

- 🇺🇸 English (en)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇹🇭 Thai (th)
- 🇻🇳 Vietnamese (vi)
- 🇨🇳 Chinese Simplified (zh-Hans)
- 🇹🇼 Chinese Traditional (zh-Hant)

## 🚀 Deployment

This website is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

### Manual Deployment
1. Build the project: `npm run build`
2. The built files are in the `dist/` directory
3. Upload the contents of `dist/` to your web server

## 📞 Contact

For technical support or questions about this website:
- Email: aftek.web@gmail.com
- Phone: +886 2 2799 6558

## 📄 License

This project is proprietary software developed for Aftek Construction Company.

---

**Built with ❤️ for Aftek Construction**
