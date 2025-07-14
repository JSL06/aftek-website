<<<<<<< HEAD
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const LOCALES_DIR = path.join(__dirname, 'src', 'locales');
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh-Hans', name: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文' },
];

// Helper to load translation file
function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.cjs`);
  if (!fs.existsSync(filePath)) return null;
  // Remove module.exports or export default
  const raw = fs.readFileSync(filePath, 'utf-8');
  let json = raw
    .replace(/^const \w+ = /, '')
    .replace(/module\.exports ?= ?\w+;?/, '')
    .replace(/export default \w+;?/, '')
    .replace(/;\s*$/, '');
  try {
    return eval('(' + json + ')');
  } catch (e) {
    return null;
  }
}

// Helper to save translation file
function saveTranslations(lang, data) {
  const filePath = path.join(LOCALES_DIR, `${lang}.cjs`);
  const content = `const ${lang} = ${JSON.stringify(data, null, 2)};\nmodule.exports = ${lang};\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

// API: Get all languages
app.get('/api/languages', (req, res) => {
  res.json(LANGUAGES);
});

// API: Get translations for a language
app.get('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const data = loadTranslations(lang);
  if (!data) return res.status(404).json({ error: 'Language file not found' });
  res.json(data);
});

// API: Save translations for a language
app.post('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const data = req.body;
  try {
    saveTranslations(lang, data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Serve the editor UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'translation-editor-ui.html'));
});

app.listen(PORT, () => {
  console.log(`Translation Editor running at http://localhost:${PORT}`);
=======
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const LOCALES_DIR = path.join(__dirname, 'src', 'locales');
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh-Hans', name: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文' },
];

// Helper to load translation file
function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.cjs`);
  if (!fs.existsSync(filePath)) return null;
  // Remove module.exports or export default
  const raw = fs.readFileSync(filePath, 'utf-8');
  let json = raw
    .replace(/^const \w+ = /, '')
    .replace(/module\.exports ?= ?\w+;?/, '')
    .replace(/export default \w+;?/, '')
    .replace(/;\s*$/, '');
  try {
    return eval('(' + json + ')');
  } catch (e) {
    return null;
  }
}

// Helper to save translation file
function saveTranslations(lang, data) {
  const filePath = path.join(LOCALES_DIR, `${lang}.cjs`);
  const content = `const ${lang} = ${JSON.stringify(data, null, 2)};\nmodule.exports = ${lang};\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

// API: Get all languages
app.get('/api/languages', (req, res) => {
  res.json(LANGUAGES);
});

// API: Get translations for a language
app.get('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const data = loadTranslations(lang);
  if (!data) return res.status(404).json({ error: 'Language file not found' });
  res.json(data);
});

// API: Save translations for a language
app.post('/api/translations/:lang', (req, res) => {
  const lang = req.params.lang;
  const data = req.body;
  try {
    saveTranslations(lang, data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Serve the editor UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'translation-editor-ui.html'));
});

app.listen(PORT, () => {
  console.log(`Translation Editor running at http://localhost:${PORT}`);
>>>>>>> 8f1a792a58507ae54dbf3ae5d14d955801c27444
}); 