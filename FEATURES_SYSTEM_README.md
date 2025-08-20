# Master Features System

## Overview

The Master Features System replaces the hardcoded product features with a database-driven approach that provides:

- **Centralized Management**: All features are stored in a single database location
- **Multilingual Support**: Features are automatically translated for all supported languages
- **Alphabetical Ordering**: Features are organized alphabetically within categories
- **Search Functionality**: Users can search features in any supported language
- **Easy Maintenance**: Add, remove, or modify features from one place

## Database Structure

### Tables

#### 1. `master_features`
Stores the core feature information:
- `id`: Unique UUID identifier
- `feature_key`: Machine-readable key (e.g., 'indoor-use', 'waterproof')
- `category`: Feature category ('environment', 'performance', 'material', 'special')
- `display_order`: Order for display purposes
- `is_active`: Whether the feature is available for use
- `created_at`, `updated_at`: Timestamps

#### 2. `feature_translations`
Stores multilingual feature names:
- `id`: Unique UUID identifier
- `feature_id`: Reference to master_features.id
- `language_code`: Language code ('en', 'zh-Hant', 'zh-Hans', 'ja', 'ko', 'th', 'vi')
- `display_name`: Localized feature name
- `created_at`, `updated_at`: Timestamps

## Feature Categories

### Environment
Features related to where and how the product can be used:
- Abrasion Resistant
- Chemical Exposure
- Dry Conditions
- High Traffic Areas
- High Temperature
- Humid Conditions
- Indoor Use
- Low Temperature
- Outdoor Use
- Underwater

### Performance
Features related to product capabilities:
- Chemical Resistant
- Fast Cure
- Flexible
- High Strength
- Impact Resistant
- Long Lasting
- Low Odor
- Temperature Resistant
- UV Resistant
- Weather Resistant
- Waterproof

### Material Type
Features related to product composition:
- Acrylic
- Bitumen Based
- Cement Based
- Epoxy
- Fiber Reinforced
- Hybrid
- Polyurethane
- Rubber Based
- Silicone

### Special Features
Unique or specialized capabilities:
- Anti Microbial
- Biodegradable
- Eco Friendly
- Fire Resistant
- Low VOC
- Non Toxic
- Paintable
- Quick Setting
- Recyclable
- Self Leveling

## Setup Instructions

### 1. Run the SQL Script
1. Copy the contents of `SETUP_MASTER_FEATURES.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Paste the SQL script
4. Click "Run"
5. Verify the results

### 2. Verify Installation
The script will show:
- Confirmation that tables were created
- Sample features with translations
- Translation coverage for all languages

## Frontend Integration

### FeaturesChecklist Component
The `FeaturesChecklist` component now:
- Fetches features from the database via `FeaturesService`
- Displays features in organized categories
- Provides search functionality across all languages
- Shows loading and error states
- Automatically handles multilingual display

### FeaturesService
The `FeaturesService` class provides:
- `getAllFeatures()`: Fetch all active features with translations
- `getFeaturesByCategory()`: Fetch features grouped by category
- `searchFeatures(term)`: Search features by term in any language
- `getFeaturesByIds(ids)`: Fetch specific features by ID

## Usage in Product Forms

### Before (Hardcoded)
```typescript
const FEATURE_OPTIONS = [
  'Indoor Use', 'Outdoor Use', 'Waterproof', 'UV Resistant'
  // ... more hardcoded features
];
```

### After (Database-Driven)
```typescript
<FeaturesChecklist
  features={[]} // Not used anymore
  selectedFeatures={formData.features || []}
  onFeaturesChange={(featureIds) => {
    // featureIds are now database IDs
    setFormData(prev => ({ ...prev, features: featureIds }));
  }}
  language={selectedLanguage}
  placeholder={t('admin.products.searchFeatures')}
  className="mt-2"
/>
```

## Benefits

### For Developers
- **Maintainability**: No more hardcoded feature arrays
- **Consistency**: All features follow the same structure
- **Scalability**: Easy to add new features or languages
- **Type Safety**: Strong TypeScript interfaces

### For Content Managers
- **Single Source of Truth**: Manage features from one location
- **Multilingual**: Features automatically appear in all languages
- **Search**: Find features quickly in any language
- **Organization**: Features are logically categorized

### For Users
- **Consistent Experience**: Same features across all products
- **Language Support**: Features displayed in user's language
- **Easy Discovery**: Search and browse features by category
- **Professional Appearance**: Well-organized, comprehensive feature lists

## Adding New Features

### 1. Database
```sql
INSERT INTO master_features (feature_key, category, display_order) 
VALUES ('new-feature', 'performance', 50);

INSERT INTO feature_translations (feature_id, language_code, display_name)
SELECT id, 'en', 'New Feature' FROM master_features WHERE feature_key = 'new-feature';
```

### 2. Frontend
Features automatically appear in the FeaturesChecklist component - no code changes needed!

## Migration Notes

- **Backward Compatibility**: The `features` prop is kept but not used
- **Data Format**: Features are now stored as UUIDs instead of strings
- **Performance**: Features are cached and loaded once per component mount
- **Error Handling**: Graceful fallbacks for missing features or translations

## Troubleshooting

### Common Issues

1. **Features not loading**: Check if `master_features` table exists
2. **Translations missing**: Verify `feature_translations` table has data
3. **Search not working**: Ensure features have translations in all languages
4. **Component errors**: Check browser console for API errors

### Debug Commands
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('master_features', 'feature_translations');

-- Check feature count
SELECT COUNT(*) FROM master_features WHERE is_active = true;

-- Check translation coverage
SELECT language_code, COUNT(*) FROM feature_translations 
GROUP BY language_code ORDER BY language_code;
```

## Future Enhancements

- **Feature Management UI**: Admin interface for managing features
- **Feature Templates**: Pre-defined feature sets for different product types
- **Feature Analytics**: Track which features are most commonly used
- **Dynamic Categories**: Allow admins to create custom feature categories
- **Feature Dependencies**: Define relationships between features
- **Bulk Operations**: Import/export features from CSV/Excel files
