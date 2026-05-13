# Evidence Submission - Implementation Guide

## ✅ Completed Implementation

### 1. Database Layer
- ✅ Created migration file: `docs/migrations/add_milestone_evidence.sql`
- ✅ Table: `milestone_evidence` with full schema
- ✅ RLS policies for security
- ✅ Triggers for evidence count tracking
- ✅ Helper function: `get_milestone_evidence()`

### 2. API Endpoints
- ✅ `GET /api/milestones/[id]/evidence` - Fetch evidence with signed URLs
- ✅ `POST /api/milestones/[id]/evidence` - Upload files and links
- ✅ `DELETE /api/milestones/[id]/evidence` - Soft delete evidence

### 3. Frontend Components
- ✅ Enhanced `UploadEvidenceModal` with:
  - File upload (drag & drop support)
  - Multiple files support (max 5)
  - Link submission with titles
  - File validation (type, size)
  - Upload progress indicator
  - File preview list
  
- ✅ New `EvidenceReviewModal` for clients with:
  - Evidence list display
  - Image preview with lightbox
  - File download links
  - External link display
  - Approve/Request Revision actions
  
- ✅ Updated `ClientMilestoneCard` with review button
- ✅ Integrated modals into `/dashboard/milestones` page

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

You need to run the migration SQL in your Supabase dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `docs/migrations/add_milestone_evidence.sql`
3. Execute the SQL
4. Verify tables and functions are created

**Verification queries:**
```sql
-- Check table exists
SELECT * FROM milestone_evidence LIMIT 1;

-- Check function exists
SELECT get_milestone_evidence('00000000-0000-0000-0000-000000000000');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'milestone_evidence';
```

### Step 2: Setup Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `milestone-evidence`
3. Configure bucket settings:
   - **Public:** No (private bucket)
   - **File size limit:** 10MB
   - **Allowed MIME types:** 
     - image/png
     - image/jpeg
     - image/jpg
     - application/pdf
     - application/zip
     - application/x-zip-compressed

4. Add storage policies (RLS):

```sql
-- Allow freelancer to upload
CREATE POLICY "Freelancer can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'milestone-evidence' AND
  auth.uid() IN (
    SELECT freelancer_id FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id::text = (storage.foldername(name))[2]
  )
);

-- Allow project participants to view
CREATE POLICY "Project participants can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'milestone-evidence' AND
  auth.uid() IN (
    SELECT UNNEST(ARRAY[p.client_id, p.freelancer_id])
    FROM milestones m
    JOIN projects p ON m.project_id = p.id
    WHERE m.id::text = (storage.foldername(name))[2]
  )
);
```

### Step 3: Test the Implementation

#### Test as Freelancer:

1. Login as freelancer
2. Navigate to `/dashboard/milestones`
3. Select a client and project
4. Find a milestone with status "In Progress"
5. Click "Upload Bukti" button
6. Test file upload:
   - Upload 1-5 files (PNG, JPG, PDF, ZIP)
   - Verify file size validation (max 10MB)
   - Verify file type validation
7. Test link submission:
   - Add external links (Figma, GitHub, etc.)
   - Add optional link titles
8. Add description (optional)
9. Click "Kirim Kemajuan"
10. Verify:
    - Success message appears
    - Milestone status changes to "Waiting for Approval"
    - Evidence count badge updates

#### Test as Client:

1. Login as client
2. Navigate to `/dashboard/milestones`
3. Select a project
4. Find milestone with status "Waiting for Approval"
5. Click "Review Submission" button
6. Verify evidence display:
   - Files show with download links
   - Images show preview (click for lightbox)
   - Links are clickable
   - Description is visible
7. Test actions:
   - Click "Setujui Milestone" → verify status changes to "Approved"
   - OR click "Minta Revisi" → verify status returns to "In Progress"

---

## 🧪 Testing Checklist

### File Upload Tests
- [ ] Upload single file (< 10MB)
- [ ] Upload multiple files (2-5 files)
- [ ] Try to upload > 5 files (should show error)
- [ ] Try to upload file > 10MB (should show error)
- [ ] Try to upload invalid file type (should show error)
- [ ] Verify file preview in modal
- [ ] Verify file removal before submit

### Link Submission Tests
- [ ] Add single link
- [ ] Add multiple links
- [ ] Add link with custom title
- [ ] Try invalid URL format (should show error)
- [ ] Verify link preview in modal
- [ ] Verify link removal before submit

### Combined Tests
- [ ] Upload files + links together
- [ ] Add description with files
- [ ] Add description with links
- [ ] Submit without any evidence (should show error)

### Client Review Tests
- [ ] View uploaded files
- [ ] Download files
- [ ] Preview images (lightbox)
- [ ] Click external links
- [ ] Read description
- [ ] Approve milestone
- [ ] Request revision

### Edge Cases
- [ ] Upload while milestone is not "In Progress" (should fail)
- [ ] Try to upload as client (should fail)
- [ ] Try to view evidence from different project (should fail)
- [ ] Network error during upload (should show error)
- [ ] Concurrent uploads

---

## 📊 Database Schema Reference

### milestone_evidence table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| milestone_id | UUID | Foreign key to milestones |
| evidence_type | VARCHAR(10) | 'file' or 'link' |
| file_url | TEXT | Path in Supabase Storage |
| file_name | TEXT | Original filename |
| file_size | INTEGER | File size in bytes |
| file_type | VARCHAR(100) | MIME type |
| external_link | TEXT | External URL |
| link_title | TEXT | Display title for link |
| description | TEXT | Notes from freelancer |
| uploaded_by | UUID | Foreign key to profiles |
| uploaded_at | TIMESTAMP | Upload timestamp |
| is_active | BOOLEAN | Soft delete flag |
| submission_version | INTEGER | Version tracking |

### milestones table (updated)

| Column | Type | Description |
|--------|------|-------------|
| evidence_submitted_at | TIMESTAMP | First evidence submission time |
| evidence_count | INTEGER | Number of active evidence |

---

## 🔒 Security Features

1. **Authentication Required**
   - All endpoints require valid Supabase JWT
   - User must be authenticated

2. **Authorization Checks**
   - Only assigned freelancer can upload evidence
   - Only project participants can view evidence
   - Evidence can only be uploaded when milestone is "In Progress"

3. **File Validation**
   - MIME type validation (not just extension)
   - File size limit (10MB)
   - Filename sanitization

4. **Storage Security**
   - Private bucket (no public access)
   - Signed URLs with 1-hour expiry
   - RLS policies on storage objects

5. **Database Security**
   - RLS policies on milestone_evidence table
   - Foreign key constraints
   - Soft delete (preserve history)

---

## 🐛 Known Issues & Limitations

1. **File Upload Progress**
   - Progress bar is simulated (10% → 30% → 80% → 100%)
   - Real upload progress tracking requires additional implementation

2. **Drag & Drop**
   - UI shows drag & drop area but functionality not fully implemented
   - Currently only supports click-to-upload

3. **Image Preview**
   - Only shows preview after upload, not during selection
   - Could add preview before upload for better UX

4. **Concurrent Uploads**
   - Multiple simultaneous uploads not optimized
   - Could implement queue system

5. **Storage Cleanup**
   - No automatic cleanup of orphaned files
   - Should implement cleanup job for deleted evidence

---

## 🔄 Future Enhancements

1. **Phase 2 Features**
   - [ ] Video file support (MP4, MOV)
   - [ ] Inline PDF preview
   - [ ] Markdown support in description
   - [ ] Evidence versioning (track revisions)
   - [ ] Bulk download (ZIP all evidence)
   - [ ] Evidence comments/feedback from client

2. **Phase 3 Features**
   - [ ] Email notifications
   - [ ] Mobile app support
   - [ ] OCR for text extraction from images
   - [ ] AI-powered evidence validation
   - [ ] Real-time upload progress
   - [ ] Chunked upload for large files

---

## 📝 API Documentation

### POST /api/milestones/[id]/evidence

Upload evidence for a milestone.

**Request (multipart/form-data):**
```typescript
{
  files?: File[],              // Max 5 files, 10MB each
  links?: string[],            // JSON array of URLs
  linkTitles?: string[],       // JSON array of titles
  description?: string         // Optional notes
}
```

**Response (201 Created):**
```typescript
{
  success: true,
  data: {
    evidenceIds: string[],
    milestone: {
      id: string,
      status: "Waiting for Approval",
      evidence_count: number
    }
  },
  warnings?: string[]          // Partial upload errors
}
```

**Error Responses:**
- 400: Invalid file type/size, invalid URL, missing evidence
- 401: Unauthorized (not authenticated)
- 403: Not assigned freelancer, milestone not "In Progress"
- 413: File too large
- 500: Upload failed

### GET /api/milestones/[id]/evidence

Retrieve all evidence for a milestone.

**Response (200 OK):**
```typescript
{
  success: true,
  data: {
    evidence: Array<{
      id: string,
      evidence_type: 'file' | 'link',
      file_url?: string,
      file_name?: string,
      file_size?: number,
      file_type?: string,
      external_link?: string,
      link_title?: string,
      description?: string,
      uploaded_at: string,
      uploader_name: string,
      signed_url?: string        // For files only, 1-hour expiry
    }>,
    milestone: {
      id: string,
      title: string,
      status: string,
      evidence_count: number
    }
  }
}
```

### DELETE /api/milestones/[id]/evidence?evidenceId={id}

Soft delete evidence (set is_active = false).

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Evidence deleted successfully"
}
```

**Error Responses:**
- 400: Missing evidenceId
- 401: Unauthorized
- 403: Not owner, milestone approved/completed
- 404: Evidence not found
- 500: Delete failed

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: "Failed to upload evidence"**
- Check Supabase Storage bucket exists
- Verify RLS policies are set correctly
- Check file size and type
- Verify user is assigned freelancer

**Issue: "Evidence not found"**
- Check milestone_id is correct
- Verify user has access to project
- Check evidence is_active = true

**Issue: "Cannot upload evidence"**
- Verify milestone status is "In Progress"
- Check user role is "freelancer"
- Verify user is assigned to project

**Issue: "Signed URL expired"**
- Signed URLs expire after 1 hour
- Refresh the page to get new signed URLs

---

**Last Updated:** 2026-05-13  
**Version:** 1.0.0  
**Status:** ✅ Ready for Testing
