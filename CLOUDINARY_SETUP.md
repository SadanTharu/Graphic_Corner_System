# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides storage, optimization, and delivery of media files. It's used in this project to store all uploaded files (images, videos, documents) instead of local file storage.

## Benefits of Using Cloudinary

✅ **Cloud Storage** - No local disk space needed
✅ **Automatic Optimization** - Images and videos are automatically optimized
✅ **CDN Delivery** - Fast content delivery worldwide
✅ **Format Conversion** - Automatic format conversion
✅ **Transformations** - Resize, crop, and edit on-the-fly
✅ **Secure** - Built-in security features
✅ **Free Tier** - 25 GB storage and 25 GB bandwidth/month free

---

## Step-by-Step Setup

### 1. Create Cloudinary Account

1. Visit [cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Fill in your details or sign up with Google/GitHub
4. Verify your email address

### 2. Get Your Credentials

After logging in, you'll see your **Dashboard**.

Copy these three values:
- **Cloud Name**
- **API Key**
- **API Secret**

You can find them at: [cloudinary.com/console](https://cloudinary.com/console)

### 3. Update Backend Environment Variables

Open `backend/.env` and update:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_FOLDER=graphic_corner
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dgxyz123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
CLOUDINARY_FOLDER=graphic_corner
```

### 4. Verify Connection

Start the backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas
☁️  Cloudinary connected successfully
🚀 Server running on port 5000
```

---

## Using Cloudinary in the App

### Upload Files

**Single File Upload:**
```javascript
const formData = new FormData();
formData.append('file', fileObject);

const response = await fetch('/api/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.file.url); // Cloudinary URL
```

**Multiple Files Upload:**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('files', file));

const response = await fetch('/api/upload/multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### File Response Format

```json
{
  "message": "File uploaded successfully",
  "file": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/graphic_corner/filename.jpg",
    "publicId": "graphic_corner/1234567890-filename",
    "originalName": "myfile.jpg",
    "size": 245678,
    "format": "jpg",
    "resourceType": "image",
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

## Cloudinary Dashboard Features

### 1. Media Library
View all uploaded files at: [cloudinary.com/console/media_library](https://cloudinary.com/console/media_library)

- Browse files by folder
- Search functionality
- Preview images and videos
- Delete files manually

### 2. Usage Statistics
Monitor your usage at: [cloudinary.com/console/usages](https://cloudinary.com/console/usages)

- Storage used
- Bandwidth consumed
- Transformations performed
- API requests

### 3. Transformations

Cloudinary allows you to transform images on-the-fly by modifying the URL:

**Original:**
```
https://res.cloudinary.com/demo/image/upload/sample.jpg
```

**Resize to 300x300:**
```
https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/sample.jpg
```

**Apply quality and format:**
```
https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/sample.jpg
```

---

## Supported File Types

### Images
- JPEG, JPG, PNG, GIF, WebP
- SVG, BMP, TIFF
- PSD (Photoshop), AI (Illustrator)

### Videos
- MP4, MOV, AVI, MKV
- WebM, FLV, WMV

### Documents
- PDF
- ZIP, RAR (archives)

### File Size Limits

- **Free Tier:** 100 MB per file
- **Paid Plans:** Up to 2 GB per file
- **Project Default:** 50 MB (configured in `.env`)

---

## Folder Structure

Files are organized in Cloudinary:

```
graphic_corner/          # Main folder (set in .env)
├── orders/             # Order-related files
├── profiles/           # User avatars
├── watermarks/         # Preview watermarks
└── final/              # Final deliverables
```

---

## Troubleshooting

### Connection Failed
**Error:** `Cloudinary connection failed`

**Solutions:**
1. Check your credentials in `.env`
2. Ensure no spaces in values
3. Verify account is active at cloudinary.com
4. Check internet connection

### Upload Failed
**Error:** `Upload failed: Invalid resource type`

**Solutions:**
1. Check file type is supported
2. Verify file is not corrupted
3. Check file size < 50MB (or your limit)

### Invalid Signature
**Error:** `Invalid signature`

**Solution:**
- Your API Secret is incorrect
- Copy it again from Cloudinary dashboard

---

## Security Best Practices

### 1. Never Commit .env Files
```bash
# .gitignore already includes:
.env
```

### 2. Use Environment Variables
Never hardcode credentials in code:
```javascript
// ❌ Bad
const cloudName = 'dgxyz123';

// ✅ Good
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
```

### 3. Restrict Upload Permissions
In Cloudinary dashboard:
- Settings → Upload → Upload presets
- Set restrictions on file types and sizes

---

## Pricing & Limits

### Free Tier (Forever Free)
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited image and video transformations

### When to Upgrade
Upgrade if you exceed:
- Storage: > 25 GB
- Bandwidth: > 25 GB/month
- Transformations: > 25,000/month

View pricing: [cloudinary.com/pricing](https://cloudinary.com/pricing)

---

## Advanced Features (Optional)

### 1. Automatic Image Optimization
Add to upload options:
```javascript
{
  quality: 'auto',
  fetch_format: 'auto'
}
```

### 2. Responsive Images
```javascript
{
  responsive: true,
  width: 'auto',
  crop: 'scale'
}
```

### 3. Video Transcoding
Cloudinary automatically transcodes videos to web-optimized formats.

---

## Resources

- **Dashboard:** [cloudinary.com/console](https://cloudinary.com/console)
- **Documentation:** [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **API Reference:** [cloudinary.com/documentation/image_upload_api_reference](https://cloudinary.com/documentation/image_upload_api_reference)
- **Support:** [support.cloudinary.com](https://support.cloudinary.com)

---

**✅ Setup Complete!** Your files are now stored securely in the cloud with Cloudinary.
