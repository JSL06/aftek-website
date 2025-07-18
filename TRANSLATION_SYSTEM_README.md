# Aftek Website Translation System

## Overview

The Aftek website supports 7 languages: English (EN), Simplified Chinese (CN), Traditional Chinese (TW), Japanese (JP), Korean (KR), Thai (TH), and Vietnamese (VN). This document provides a comprehensive guide to the translation system, including how to audit, fix, and maintain translations.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Translation Files Structure](#translation-files-structure)
3. [Translation Hook Usage](#translation-hook-usage)
4. [Admin Translation Dashboard](#admin-translation-dashboard)
5. [Translation Audit Tools](#translation-audit-tools)
6. [Auto-Translation Services](#auto-translation-services)
7. [Common Issues and Fixes](#common-issues-and-fixes)
8. [Best Practices](#best-practices)
9. [Maintenance Procedures](#maintenance-procedures)

## System Architecture

### Components

1. **Translation Files** (`src/locales/`)
   - Individual TypeScript files for each language
   - Structured key-value pairs
   - Type-safe translations

2. **Translation Hook** (`src/hooks/useTranslation.ts`)
   - Manages current language state
   - Provides fallback mechanisms
   - Integrates with Supabase for dynamic translations

3. **Translation Service** (`src/services/translationService.ts`)
   - Auto-translation capabilities
   - Multiple translation service support
   - Caching system

4. **Admin Dashboard** (`src/pages/admin/TranslationDashboard.tsx`)
   - Visual translation status monitoring
   - Missing key identification
   - Translation management tools

5. **Audit Tools** (`src/utils/translationAudit.ts`, `scripts/translationAudit.js`)
   - Comprehensive translation analysis
   - Automated fixing capabilities
   - Export/import functionality

### Language Codes

| Language | Code | Native Name | Flag |
|----------|------|-------------|------|
| English | `en` | English | 🇺🇸 |
| Simplified Chinese | `zh-Hans` | 简体中文 | 🇨🇳 |
| Traditional Chinese | `zh-Hant` | 繁體中文 | 🇹🇼 |
| Japanese | `ja` | 日本語 | 🇯🇵 |
| Korean | `ko` | 한국어 | 🇰🇷 |
| Thai | `th` | ไทย | 🇹🇭 |
| Vietnamese | `vi` | Tiếng Việt | 🇻🇳 |

## Translation Files Structure

### File Organization

```
src/locales/
├── en.ts          # English (source language)
├── zh-Hans.ts     # Simplified Chinese
├── zh-Hant.ts     # Traditional Chinese
├── ja.ts          # Japanese
├── ko.ts          # Korean
├── th.ts          # Thai
└── vi.ts          # Vietnamese
```

### Translation Key Structure

Translation keys follow a hierarchical naming convention:

```typescript
const en = {
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.products': 'Products',
  
  // Home page
  'home.hero.title': 'Excellence in Construction',
  'home.hero.subtitle': 'Professional construction solutions...',
  'home.mission.title': 'Mission Statement',
  
  // Common UI elements
  'ui.learnMore': 'Learn More',
  'ui.viewAll': 'View All',
  'ui.download': 'Download',
  
  // Footer
  'footer.contact.title': 'Contact Us',
  'footer.copyright': 'All rights reserved.',
  
  // Error pages
  'error.notFound.title': 'Page Not Found',
  'error.notFound.message': 'The page you are looking for does not exist.',
  
  // Loading states
  'loading.general': 'Loading...',
  'loading.products': 'Loading products...',
};
```

### Key Naming Conventions

- **Navigation**: `nav.{page}`
- **Page content**: `{page}.{section}.{element}`
- **Common UI**: `ui.{action}`
- **Footer**: `footer.{section}.{element}`
- **Errors**: `error.{type}.{element}`
- **Loading**: `loading.{context}`
- **Forms**: `{page}.form.{field}`

## Translation Hook Usage

### Basic Usage

```typescript
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('home.hero.subtitle')}</p>
      <button onClick={() => changeLanguage('ja')}>
        Switch to Japanese
      </button>
    </div>
  );
};
```

### Fallback Mechanism

The translation hook implements a robust fallback system:

1. **Primary**: Local translation files
2. **Secondary**: Database translations (Supabase)
3. **Tertiary**: Fallback translations (hardcoded)
4. **Final**: Translation key itself

### Language Persistence

The current language is automatically saved to localStorage and persists across browser sessions.

## Admin Translation Dashboard

### Access

Navigate to `/admin/translation-dashboard` to access the translation management interface.

### Features

1. **Overview Statistics**
   - Total languages and keys
   - Missing translation count
   - Issues found

2. **Language Coverage Cards**
   - Visual progress indicators
   - Coverage percentages
   - Complete vs missing counts

3. **Detailed Analysis Tabs**
   - **Overview**: Language-by-language breakdown
   - **Missing Keys**: Searchable list of missing translations
   - **Issues**: Duplicate keys and inconsistencies
   - **Recommendations**: Actionable suggestions

4. **Export Functionality**
   - Download complete translation sets
   - JSON format for external tools

### Usage

1. **Monitor Status**: Check coverage percentages and identify gaps
2. **Find Missing Keys**: Use search to locate specific missing translations
3. **Export Data**: Download translations for external review
4. **Refresh Data**: Update statistics after making changes

## Translation Audit Tools

### Automated Audit Script

Run the audit script to analyze all translations:

```bash
# Basic audit
node scripts/translationAudit.js

# Audit with auto-fix
node scripts/translationAudit.js --fix-missing

# Export translations
node scripts/translationAudit.js --export

# Full audit with validation
node scripts/translationAudit.js --audit-only --validate
```

### Audit Features

1. **Coverage Analysis**
   - Percentage of translated content per language
   - Missing key identification
   - Auto-translated content tracking

2. **Quality Checks**
   - Duplicate key detection
   - Inconsistent translation identification
   - Empty value detection

3. **Auto-Translation**
   - LibreTranslate integration (free)
   - Google Translate API support (optional)
   - Fallback translation system

4. **Export Capabilities**
   - Individual language JSON files
   - Master translation map
   - Status reports

### Audit Output

The script provides detailed output including:

```
📊 Translation Status Report
==================================================
Total translation keys: 245
Languages: 7

English (en):
  Coverage: ██████████ 100%
  Complete: 245, Missing: 0, Auto-translated: 0

简体中文 (zh-Hans):
  Coverage: ████████░░ 80%
  Complete: 196, Missing: 49, Auto-translated: 0

...

❌ Missing Translation Keys:
------------------------------
  home.newFeature.title: missing in ja, ko, th, vi
  products.filter.new: missing in zh-Hans, zh-Hant
```

## Auto-Translation Services

### Supported Services

1. **LibreTranslate** (Default, Free)
   - No API key required
   - Rate limited
   - Good quality for common languages

2. **Google Translate API** (Optional)
   - Requires API key
   - Higher quality
   - Better for technical terms

3. **Fallback System**
   - Predefined common translations
   - Placeholder generation
   - Error handling

### Configuration

```typescript
// Using LibreTranslate (default)
const result = await translateText('Hello World', 'ja');

// Using Google Translate API
const result = await translateText('Hello World', 'ja', {
  useGoogleTranslate: true,
  googleApiKey: 'your-api-key'
});

// Batch translation
const results = await translateBatch(['Hello', 'World'], 'ja', {
  delay: 200 // Delay between requests
});
```

### Caching

Translations are automatically cached for 24 hours to:
- Reduce API calls
- Improve performance
- Avoid rate limiting

## Common Issues and Fixes

### Issue 1: English Text Appearing in Non-English Pages

**Symptoms**: Some text displays in English when another language is selected

**Causes**:
- Missing translation keys
- Hardcoded text in components
- Translation hook not used

**Solutions**:
1. Replace hardcoded text with translation keys
2. Add missing translations
3. Ensure all components use the translation hook

**Example Fix**:
```typescript
// Before
<h1>Welcome to our website</h1>

// After
<h1>{t('home.welcome.title')}</h1>
```

### Issue 2: Inconsistent Translations

**Symptoms**: Same key has different meanings across languages

**Causes**:
- Manual translation errors
- Context misunderstanding
- Auto-translation issues

**Solutions**:
1. Review and standardize translations
2. Use consistent terminology
3. Implement translation validation

### Issue 3: Missing Translation Keys

**Symptoms**: Translation keys appear instead of translated text

**Causes**:
- New content added without translations
- Keys not added to all language files
- Database sync issues

**Solutions**:
1. Run translation audit
2. Add missing translations
3. Use auto-translation for quick fixes

### Issue 4: Performance Issues

**Symptoms**: Slow page loading, translation delays

**Causes**:
- Large translation files
- Inefficient fallback chains
- No caching

**Solutions**:
1. Optimize translation file size
2. Implement proper caching
3. Use lazy loading for translations

## Best Practices

### 1. Key Naming

- Use descriptive, hierarchical keys
- Follow consistent naming patterns
- Avoid generic keys like `text1`, `text2`

```typescript
// Good
'home.hero.title'
'products.filter.category.waterproofing'
'contact.form.email.placeholder'

// Avoid
'text1'
'button1'
'label'
```

### 2. Translation Content

- Keep translations concise but clear
- Maintain consistent tone across languages
- Use appropriate cultural context

### 3. Technical Terms

- Maintain brand names in English
- Use consistent technical terminology
- Provide context for industry-specific terms

### 4. Pluralization

- Handle plural forms appropriately
- Use language-specific pluralization rules
- Consider cultural differences in number formatting

### 5. Character Limits

- Consider text expansion/contraction
- Design UI to accommodate longer translations
- Test with all supported languages

## Maintenance Procedures

### Regular Maintenance Schedule

1. **Weekly**
   - Check translation dashboard for new missing keys
   - Review auto-translated content
   - Monitor translation quality

2. **Monthly**
   - Run full translation audit
   - Update translation files
   - Review and fix inconsistencies

3. **Quarterly**
   - Comprehensive translation review
   - Update terminology database
   - Performance optimization

### Adding New Content

1. **Identify translatable text**
2. **Create translation keys**
3. **Add English translations**
4. **Run auto-translation for other languages**
5. **Review and refine translations**
6. **Test in all languages**

### Quality Assurance

1. **Automated Checks**
   - Run translation audit script
   - Check for missing keys
   - Validate consistency

2. **Manual Review**
   - Review auto-translated content
   - Check cultural appropriateness
   - Verify technical accuracy

3. **User Testing**
   - Test with native speakers
   - Gather feedback on translations
   - Monitor user experience

### Performance Optimization

1. **File Size Management**
   - Remove unused translations
   - Compress translation files
   - Use lazy loading

2. **Caching Strategy**
   - Implement proper caching
   - Use CDN for static files
   - Optimize database queries

3. **Loading Optimization**
   - Preload critical translations
   - Use progressive loading
   - Minimize translation file size

## Troubleshooting

### Common Error Messages

1. **"Translation key not found"**
   - Add missing translation key
   - Check key spelling
   - Verify key exists in all language files

2. **"Translation service unavailable"**
   - Check internet connection
   - Verify API keys (if using Google Translate)
   - Try fallback translation

3. **"Database connection error"**
   - Check Supabase connection
   - Verify database schema
   - Check authentication

### Debug Mode

Enable debug mode to see detailed translation information:

```typescript
// In development
const DEBUG_TRANSLATIONS = true;

if (DEBUG_TRANSLATIONS) {
  console.log('Translation key:', key);
  console.log('Current language:', currentLanguage);
  console.log('Translation value:', value);
}
```

### Support

For translation system issues:

1. Check this documentation
2. Run translation audit script
3. Review console errors
4. Contact development team

## Conclusion

The Aftek translation system provides comprehensive multilingual support with automated tools for maintenance and quality assurance. Regular use of the audit tools and following best practices will ensure a high-quality multilingual experience for all users.

For questions or issues, refer to this documentation or contact the development team. 