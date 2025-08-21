# AFTEK Image Management System

## Overview

The AFTEK Image Management System provides a comprehensive solution for managing images, background images, and media files across the website. It includes:

- **Media Library**: Upload, organize, and manage all media files
- **Page Backgrounds**: Configure unique background images for each page
- **Storage Monitoring**: Track storage usage and quotas
- **Admin Interface**: Full management through the admin dashboard

## Features

### 🖼️ Media Library
- **File Upload**: Support for images (JPEG, PNG, GIF, WebP), videos, and documents (PDF, Word)
- **File Management**: Edit metadata, organize by categories, add tags
- **Search & Filter**: Find files by name, description, tags, or category
- **File Operations**: Download, delete, make public/private
- **Storage Quotas**: Automatic monitoring of Supabase storage limits

### 🎨 Page Backgrounds
- **Unique Backgrounds**: Each page can have its own background image
- **Advanced Styling**: Configure position, size, repeat, attachment
- **Overlay Support**: Add color overlays with adjustable opacity
- **Real-time Preview**: See changes before saving
- **Media Integration**: Select images directly from the media library

### 📊 Storage Management
- **Usage Monitoring**: Real-time tracking of storage consumption
- **Quota Warnings**: Automatic alerts when approaching limits
- **Status Indicators**: Visual feedback for storage health
- **Cleanup Tools**: Identify and remove unused files

## Database Schema

### Tables

#### `media_files`
Stores all uploaded media files with metadata:
```sql
- id: UUID (Primary Key)
- filename: VARCHAR (Generated unique filename)
- original_filename: VARCHAR (Original upload filename)
- file_path: VARCHAR (Storage path)
- file_size: BIGINT (File size in bytes)
- mime_type: VARCHAR (File MIME type)
- width: INTEGER (Image width, if applicable)
- height: INTEGER (Image height, if applicable)
- alt_text: TEXT (Accessibility text)
- description: TEXT (File description)
- tags: TEXT[] (Array of tags)
- uploaded_by: UUID (User who uploaded)
- is_public: BOOLEAN (Public visibility)
- category_id: UUID (Category reference)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `page_backgrounds`
Manages background image configuration for each page:
```sql
- id: UUID (Primary Key)
- page_identifier: VARCHAR (Unique page identifier)
- page_name: VARCHAR (Human-readable page name)
- background_image_id: UUID (Reference to media file)
- background_image_url: VARCHAR (Direct image URL)
- background_position: VARCHAR (CSS background-position)
- background_size: VARCHAR (CSS background-size)
- background_repeat: VARCHAR (CSS background-repeat)
- background_attachment: VARCHAR (CSS background-attachment)
- overlay_color: VARCHAR (Hex color for overlay)
- overlay_opacity: DECIMAL (Overlay opacity 0.0-1.0)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `storage_usage`
Tracks storage consumption:
```sql
- id: UUID (Primary Key)
- bucket_name: VARCHAR (Storage bucket name)
- total_size: BIGINT (Total bytes used)
- file_count: INTEGER (Number of files)
- last_updated: TIMESTAMP
```

#### `storage_quotas`
Defines storage limits and thresholds:
```sql
- id: UUID (Primary Key)
- bucket_name: VARCHAR (Storage bucket name)
- max_size: BIGINT (Maximum allowed bytes)
- warning_threshold: DECIMAL (Warning percentage)
- critical_threshold: DECIMAL (Critical percentage)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `media_categories`
Organizes media files into categories:
```sql
- id: UUID (Primary Key)
- name: VARCHAR (Category name)
- description: TEXT (Category description)
- parent_id: UUID (Parent category, if hierarchical)
- created_at: TIMESTAMP
```

### Views

#### `media_library_view`
Combines media files with category and user information for easy querying.

#### `page_backgrounds_view`
Joins page backgrounds with media file information for display.

### Functions

#### `check_storage_quota()`
Returns current storage usage status with warnings and critical alerts.

#### `update_storage_usage()`
Automatically updates storage usage when files are added/removed.

## Installation & Setup

### 1. Database Setup
Run the SQL script to create all necessary tables and functions:
```bash
# Option 1: Use the batch file
DEPLOY-IMAGE-MANAGEMENT.bat

# Option 2: Run manually in Supabase dashboard
# Copy contents of CREATE_IMAGE_MANAGEMENT_SYSTEM.sql
```

### 2. Supabase Storage Bucket
Create a storage bucket named `media` in your Supabase project:
```sql
-- In Supabase dashboard > Storage
-- Create bucket: "media"
-- Set as public
-- Enable RLS policies
```

### 3. Environment Variables
Ensure your environment variables are set:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Build & Deploy
```bash
npm run build
npm run preview
```

## Usage

### For Administrators

#### Media Management
1. Navigate to `/admin/media`
2. Use the "Upload Media" button to add new files
3. Organize files with categories and tags
4. Edit metadata and manage visibility

#### Background Image Management
1. Navigate to `/admin/backgrounds`
2. Select a page to configure
3. Choose background image from media library
4. Adjust styling properties (position, size, repeat, attachment)
5. Add overlay color and opacity if desired
6. Preview changes before saving

#### Storage Monitoring
1. Check storage usage in the "Storage" tab
2. Monitor quota warnings and critical alerts
3. Clean up unused files when approaching limits

### For Developers

#### Using Background Images in Components
```tsx
import { BackgroundImage } from '@/components/ui/BackgroundImage';

const MyPage = () => {
  return (
    <BackgroundImage pageIdentifier="home">
      <div className="content">
        <h1>Welcome to AFTEK</h1>
        <p>Your content here</p>
      </div>
    </BackgroundImage>
  );
};
```

#### Using the Background Image Hook
```tsx
import { useBackgroundImages } from '@/hooks/useBackgroundImages';

const MyComponent = () => {
  const { getBackgroundStyle, getBackgroundImage } = useBackgroundImages();
  
  const backgroundStyle = getBackgroundStyle('home');
  const imageUrl = getBackgroundImage('home');
  
  return (
    <div style={backgroundStyle}>
      {/* Your content */}
    </div>
  );
};
```

#### Media Service Integration
```tsx
import { mediaService } from '@/services/mediaService';

// Upload a file
const uploadFile = async (file: File) => {
  try {
    const result = await mediaService.uploadFile({
      file,
      altText: 'Description',
      description: 'Detailed description',
      tags: ['tag1', 'tag2'],
      isPublic: true
    });
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Get media files
const loadMedia = async () => {
  const files = await mediaService.getMediaFiles({
    categoryId: 'backgrounds',
    search: 'hero',
    limit: 10
  });
  return files;
};
```

## Configuration

### Default Page Backgrounds
The system automatically creates background configurations for:
- `home` - Home Page
- `about` - About Page
- `products` - Products Page
- `projects` - Projects Page
- `articles` - Articles Page
- `contact` - Contact Page
- `admin-dashboard` - Admin Dashboard

### Storage Quotas
Default quotas are set for Supabase free tier:
- **Media bucket**: 1GB (80% warning, 95% critical)
- **Avatars bucket**: 50MB (80% warning, 95% critical)

### File Type Restrictions
Supported file types:
- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Videos**: MP4, WebM, OGV
- **Maximum file size**: 10MB

## Security

### Row Level Security (RLS)
- **Media files**: Users can only manage their own uploads
- **Page backgrounds**: Authenticated users can manage all backgrounds
- **Public access**: Background images are publicly readable

### File Access Control
- **Public files**: Accessible to all visitors
- **Private files**: Only accessible to authenticated users
- **Category-based organization**: Logical grouping for better management

## Troubleshooting

### Common Issues

#### Storage Quota Exceeded
```
Error: Storage quota exceeded
Solution: 
1. Check storage usage in admin panel
2. Remove unused files
3. Consider upgrading Supabase plan
4. Compress existing images
```

#### File Upload Failures
```
Error: Upload failed
Solutions:
1. Check file size (max 10MB)
2. Verify file type is supported
3. Ensure storage bucket exists
4. Check network connectivity
```

#### Background Images Not Displaying
```
Issue: Background images not showing
Solutions:
1. Verify page identifier matches database
2. Check if image is public
3. Ensure correct file path
4. Verify Supabase storage permissions
```

### Performance Optimization

#### Image Optimization
- Use WebP format for better compression
- Resize images to appropriate dimensions
- Implement lazy loading for large galleries
- Use CDN for global distribution

#### Database Optimization
- Regular cleanup of unused files
- Monitor query performance
- Use appropriate indexes
- Archive old media files

## API Reference

### Media Service Methods

#### `uploadFile(options: MediaUploadOptions)`
Uploads a file to storage and creates a media record.

#### `getMediaFiles(options?: FilterOptions)`
Retrieves media files with optional filtering.

#### `updateMediaFile(id: string, updates: MediaFileUpdate)`
Updates media file metadata.

#### `deleteMediaFile(id: string)`
Deletes a media file and removes from storage.

#### `getPageBackground(pageIdentifier: string)`
Gets background configuration for a specific page.

#### `updatePageBackground(pageIdentifier: string, config: BackgroundImageConfig)`
Updates page background configuration.

#### `checkStorageQuota()`
Returns current storage usage and quota status.

### Background Image Hook

#### `useBackgroundImages()`
Returns methods for managing background images:
- `getBackgroundStyle(pageIdentifier)`: CSS properties for background
- `getBackgroundImage(pageIdentifier)`: Direct image URL
- `getBackgroundConfig(pageIdentifier)`: Full configuration object
- `isLoading`: Loading state
- `error`: Error information

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Add comprehensive documentation

### Testing
- Test file uploads with various file types
- Verify background image configurations
- Test storage quota monitoring
- Validate RLS policies

## Support

For technical support or questions:
1. Check this documentation
2. Review error logs in browser console
3. Verify Supabase configuration
4. Contact development team

## Changelog

### Version 1.0.0
- Initial release of image management system
- Media library with upload and management
- Page background configuration
- Storage monitoring and quotas
- Admin interface integration
- RLS security implementation
