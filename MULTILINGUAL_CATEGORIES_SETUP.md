# 🌍 Multilingual Categories Setup Guide

## 🎯 What This System Provides

- **6 Base Categories** in all 7 languages (EN, ZH-Hant, ZH-Hans, JA, KO, TH, VI)
- **Language-specific editing** with tabs like the ProductEdit page
- **Frontend language switching** - categories automatically change with language
- **Full CRUD operations** - add, edit, delete, activate/deactivate categories

## 🚀 Setup Steps

### Step 1: Run the Database Setup
1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy and paste** `SETUP_MULTILINGUAL_CATEGORIES.sql`
3. **Click "Run"**
4. **Verify** you see "Multilingual categories setup complete!"

### Step 2: Test the System
1. **Go to Admin → Category Manager** (`/admin/category-manager`)
2. **You should see 6 categories** with language badges showing ✓/✗
3. **Click Edit** on any category to see the language tabs
4. **Switch between languages** to see translations

### Step 3: Test Frontend Language Switching
1. **Go to Products page** (`/products`)
2. **Change language** using the language selector
3. **Category filter dropdown** should show categories in the selected language

## 📊 The 6 Categories (All Languages)

| English | 繁體中文 | 简体中文 | 日本語 | 한국어 | ไทย | Tiếng Việt |
|---------|----------|----------|--------|--------|------|-------------|
| Waterproofing | 防水 | 防水 | 防水 | 방수 | กันน้ำ | Chống thấm |
| Sealant | 密封膠 | 密封胶 | シーラント | 실런트 | ซีแลนท์ | Chất bịt kín |
| Adhesive | 黏合劑 | 黏合剂 | 接着剤 | 접착제 | กาว | Chất kết dính |
| Redi-Mix G&M | 預拌砂漿 | 预拌砂浆 | レディミックスG&M | 레디믹스 G&M | เรดี้มิกซ์ G&M | Vữa trộn sẵn G&M |
| Flooring | 地板 | 地板 | 床材 | 바닥재 | พื้น | Sàn |
| Other Specialties | 其他專業 | 其他专业 | その他の専門 | 기타 전문 | ความเชี่ยวชาญอื่นๆ | Chuyên môn khác |

## 🔧 How It Works

### Database Structure
- **`product_categories`** - Base category info (id, display_order, is_active)
- **`category_translations`** - Multilingual names/descriptions per category

### Frontend Integration
- **`useCategories(currentLanguage)`** - Loads categories in selected language
- **Category filter** - Shows translated names, filters by original names
- **Language switching** - Automatically refreshes category display

### Admin Panel
- **Language tabs** - Edit each language separately
- **Translation status** - See which languages have content (✓/✗)
- **Unified editing** - Save all languages together

## 🎨 Features

✅ **Multilingual editing** with language tabs  
✅ **Frontend language switching**  
✅ **Add/Edit/Delete categories**  
✅ **Activate/Deactivate categories**  
✅ **Translation status indicators**  
✅ **Professional UI** matching ProductEdit page  

## 🚨 Important Notes

- **English is required** - At least English name must be provided
- **Categories are shared** - Same categories across all companies
- **Language switching** - Works exactly like products
- **Future-proof** - Easy to add new categories and languages

## 🔍 Troubleshooting

### Categories not showing?
- Check if `SETUP_MULTILINGUAL_CATEGORIES.sql` ran successfully
- Verify `product_categories` and `category_translations` tables exist
- Check browser console for errors

### Language not switching?
- Ensure `useCategories(currentLanguage)` is called
- Verify `currentLanguage` is being passed correctly
- Check if translations exist in the database

### Admin panel not working?
- Verify RLS policies are set correctly
- Check if user is authenticated
- Ensure proper table permissions

## 🎯 Next Steps

1. **Test the system** with the steps above
2. **Customize categories** if needed
3. **Add new categories** using the admin panel
4. **Translate content** for all languages

The system is now ready for production use! 🚀
