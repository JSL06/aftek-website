# Background Integration Guide

## Overview
This guide explains how to link your existing website backgrounds to the new Background Image Manager system.

## Current Background Setup

### 1. Global Body Background
- **File**: `/aftek-website/assets/17580-CpV1zFPk.jpg`
- **Location**: `src/index.css` (body element)
- **Usage**: Applied to all pages globally
- **Current Settings**:
  - `background-size: cover`
  - `background-attachment: fixed`
  - `background-position: center`

### 2. Main Page Backgrounds
- **File**: `@/assets/17580.jpg`
- **Usage**: Applied to most content pages
- **Current Settings**:
  - `background-size: cover`
  - `background-attachment: fixed`
  - `background-position: center`

**Pages using this background**:
- About
- Products
- Projects
- Articles
- Contact
- Media
- Guide
- Resources
- Case Studies
- Article Detail
- 404 Not Found

### 3. Title Section Backgrounds
- **File**: `@/assets/pexels-pixabay-159306.png`
- **Usage**: Applied to page title sections
- **Current Settings**:
  - `background-size: cover`
  - `background-attachment: fixed`
  - `background-position: center`

### 4. Home Page Hero Background
- **File**: `@/assets/hero-aftek-construction.jpg`
- **Usage**: Home page hero section
- **Current Settings**: Custom parallax implementation

## Integration Steps

### Step 1: Run the Updated SQL Script
The updated `CREATE_IMAGE_MANAGEMENT_SYSTEM.sql` now includes all your current backgrounds:

```sql
-- All existing backgrounds are now mapped in the database
INSERT INTO page_backgrounds (page_identifier, page_name, background_image_url, ...) VALUES
    ('home', 'Home Page', '/aftek-website/assets/hero-aftek-construction.jpg', ...),
    ('about', 'About Page', '/aftek-website/assets/17580.jpg', ...),
    ('products', 'Products Page', '/aftek-website/assets/17580.jpg', ...),
    -- ... and so on
```

### Step 2: Upload Background Images to Supabase Storage
1. Go to `/admin/media`
2. Upload the following images:
   - `17580.jpg` → Category: "Backgrounds"
   - `17580-CpV1zFPk.jpg` → Category: "Backgrounds"
   - `pexels-pixabay-159306.png` → Category: "Backgrounds"
   - `hero-aftek-construction.jpg` → Category: "Backgrounds"

### Step 3: Update Background Configurations
1. Go to `/admin/backgrounds`
2. For each page, select the corresponding uploaded image
3. The system will automatically update the `background_image_id` field

### Step 4: Replace Hardcoded Backgrounds with Dynamic System

#### Option A: Use BackgroundImage Component (Recommended)
```tsx
// Before (hardcoded)
<div 
  className="min-h-screen" 
  style={{
    backgroundImage: `url(${bgMain})`,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center'
  }}
>

// After (dynamic)
<BackgroundImage 
  pageIdentifier="products"
  className="min-h-screen"
>
  {/* Your content */}
</BackgroundImage>
```

#### Option B: Use useBackgroundImages Hook
```tsx
// Before (hardcoded)
import bgMain from '@/assets/17580.jpg';

// After (dynamic)
import { useBackgroundImages } from '@/hooks/useBackgroundImages';

const MyPage = () => {
  const { getBackgroundStyle } = useBackgroundImages();
  
  return (
    <div 
      className="min-h-screen" 
      style={getBackgroundStyle('products')}
    >
      {/* Your content */}
    </div>
  );
};
```

## Page-by-Page Integration

### 1. Home Page (`/src/pages/Home.tsx`)
```tsx
// Current: Uses heroImage with parallax
// Integration: Keep current parallax logic, but make background configurable
<BackgroundImage 
  pageIdentifier="home"
  className="relative min-h-screen flex items-center"
>
  {/* Existing parallax content */}
</BackgroundImage>
```

### 2. Content Pages (About, Products, Projects, etc.)
```tsx
// Current: Uses bgMain for main background, bgTitle for title section
// Integration: Replace with dynamic system

// Main page background
<BackgroundImage 
  pageIdentifier="about"
  className="min-h-screen"
>
  {/* Title section with its own background */}
  <div className="relative py-16 mb-12">
    <BackgroundImage 
      pageIdentifier="page-title"
      className="absolute inset-0"
    />
    <div className="absolute inset-0 bg-black/40"></div>
    <div className="relative z-10 container mx-auto text-center">
      <h1 className="uniform-page-title text-white">
        {t('about.title')}
      </h1>
    </div>
  </div>
  
  {/* Page content */}
  <div className="container mx-auto p-8 max-w-4xl">
    {/* Your existing content */}
  </div>
</BackgroundImage>
```

### 3. Global Body Background
```tsx
// Current: Set in CSS
// Integration: Make configurable through admin panel

// In your main layout component
const { getBackgroundStyle } = useBackgroundImages();
const globalStyle = getBackgroundStyle('global-body');

// Apply to body or main container
useEffect(() => {
  document.body.style.backgroundImage = globalStyle.backgroundImage || '';
  document.body.style.backgroundSize = globalStyle.backgroundSize || 'cover';
  document.body.style.backgroundAttachment = globalStyle.backgroundAttachment || 'fixed';
  document.body.style.backgroundPosition = globalStyle.backgroundPosition || 'center';
}, [globalStyle]);
```

## Benefits of Integration

### 1. **Centralized Management**
- All backgrounds managed from one admin interface
- No more hardcoded image paths
- Easy to update backgrounds without code changes

### 2. **Consistent Styling**
- Standardized background properties across all pages
- Easy to maintain consistent look and feel
- Bulk updates for common properties

### 3. **Dynamic Configuration**
- Change backgrounds without redeploying
- A/B test different background images
- Seasonal or promotional background changes

### 4. **Storage Management**
- Track background image usage
- Monitor storage quotas
- Clean up unused backgrounds

## Migration Checklist

- [ ] Run updated SQL script
- [ ] Upload background images to Supabase storage
- [ ] Configure backgrounds in admin panel
- [ ] Replace hardcoded backgrounds with dynamic system
- [ ] Test all pages with new system
- [ ] Remove old background imports
- [ ] Update documentation

## Troubleshooting

### Background Not Showing
1. Check if image is uploaded to Supabase storage
2. Verify image is marked as public
3. Check browser console for errors
4. Verify page identifier matches database

### Performance Issues
1. Optimize image sizes before upload
2. Use WebP format for better compression
3. Implement lazy loading for large backgrounds
4. Monitor storage usage

### Styling Issues
1. Check CSS specificity conflicts
2. Verify background properties are applied correctly
3. Test overlay and opacity settings
4. Ensure responsive behavior works as expected

## Next Steps

1. **Immediate**: Run the SQL script and upload images
2. **Short-term**: Replace backgrounds page by page
3. **Long-term**: Add new backgrounds through admin interface
4. **Future**: Implement background scheduling and A/B testing

This integration will give you full control over all website backgrounds through the admin interface while maintaining the current visual design.
