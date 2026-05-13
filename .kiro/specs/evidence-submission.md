# Evidence Submission Feature Spec

**Feature ID:** FEAT-006  
**Priority:** High  
**Status:** In Progress  
**Created:** 2026-05-13

---

## 1. Overview

Evidence Submission adalah fitur yang memungkinkan freelancer mengirim bukti kerja (file atau link) kepada klien untuk memverifikasi progres milestone. Fitur ini merupakan bagian krusial dari workflow milestone management di FreeTrack.

### Goals
- Memungkinkan freelancer submit bukti kerja dengan mudah
- Menyimpan evidence secara aman dan terstruktur
- Memudahkan klien untuk review dan approve milestone
- Menjaga transparansi dan akuntabilitas dalam project delivery

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR-1: Evidence Upload (Freelancer)
- **FR-1.1** Freelancer dapat mengupload file sebagai bukti kerja
  - Format yang didukung: PNG, JPG, JPEG, PDF, ZIP
  - Ukuran maksimal: 10MB per file
  - Multiple files support (hingga 5 file per submission)
  
- **FR-1.2** Freelancer dapat mengirim link eksternal sebagai bukti
  - Support URL validation
  - Contoh: Figma, GitHub, Live Demo, Google Drive, dll
  - Multiple links support
  
- **FR-1.3** Freelancer dapat menambahkan deskripsi/catatan
  - Field opsional
  - Max 1000 karakter
  - Markdown support (opsional untuk fase 2)

- **FR-1.4** Freelancer dapat submit kombinasi file + link
  - Minimal 1 evidence (file atau link) wajib ada
  - Bisa kombinasi keduanya

#### FR-2: Evidence Storage
- **FR-2.1** File disimpan di Supabase Storage
  - Bucket: `milestone-evidence`
  - Path structure: `{project_id}/{milestone_id}/{timestamp}_{filename}`
  - Private bucket (authenticated access only)
  
- **FR-2.2** Metadata disimpan di database
  - Tabel: `milestone_evidence`
  - Relasi dengan milestone via `milestone_id`
  - Track upload timestamp dan uploader

#### FR-3: Evidence Display (Client)
- **FR-3.1** Client dapat melihat semua evidence yang disubmit
  - Preview untuk gambar (thumbnail + lightbox)
  - Download link untuk PDF/ZIP
  - Clickable link untuk URL eksternal
  
- **FR-3.2** Client dapat melihat deskripsi dari freelancer
  - Tampil di evidence review modal
  
- **FR-3.3** Client dapat approve/reject milestone setelah review evidence
  - Tombol approve → status "Approved"
  - Tombol request revision → kembali ke "In Progress"

#### FR-4: Validation & Error Handling
- **FR-4.1** Validasi file type
  - Reject file dengan extension tidak valid
  - Check MIME type (tidak hanya extension)
  
- **FR-4.2** Validasi file size
  - Reject file > 10MB
  - Show error message yang jelas
  
- **FR-4.3** Validasi URL format
  - Must be valid URL (https://)
  - Show error untuk invalid URL

#### FR-5: Status Management
- **FR-5.1** Upload evidence hanya bisa dilakukan saat milestone status "In Progress"
- **FR-5.2** Setelah evidence disubmit, status otomatis berubah ke "Waiting for Approval"
- **FR-5.3** Evidence tetap tersimpan meskipun milestone di-revisi (history)

### 2.2 Non-Functional Requirements

#### NFR-1: Performance
- Upload file < 5MB harus selesai dalam < 5 detik
- Preview gambar harus load dalam < 2 detik
- Support concurrent uploads (multiple files)

#### NFR-2: Security
- File hanya bisa diakses oleh freelancer (uploader) dan client (project owner)
- Signed URLs untuk download dengan expiry time
- Sanitize filename untuk prevent path traversal
- Validate MIME type untuk prevent malicious files

#### NFR-3: Usability
- Progress indicator saat upload
- Clear error messages
- Success confirmation dengan visual feedback
- Responsive design (mobile-friendly)

#### NFR-4: Reliability
- Retry mechanism untuk failed uploads
- Rollback jika upload gagal di tengah jalan
- Data consistency (evidence + status update harus atomic)

---

## 3. Technical Design

### 3.1 Database Schema

#### New Table: `milestone_evidence`

```sql
CREATE TABLE milestone_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  evidence_type VARCHAR(10) NOT NULL CHECK (evidence_type IN ('file', 'link')),
  
  -- For file uploads
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type VARCHAR(100),
  
  -- For external links
  external_link TEXT,
  link_title TEXT,
  
  -- Common fields
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  submission_version INTEGER DEFAULT 1,
  
  CONSTRAINT evidence_data_check CHECK (
    (evidence_type = 'file' AND file_url IS NOT NULL) OR
    (evidence_type = 'link' AND external_link IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_milestone_evidence_milestone ON milestone_evidence(milestone_id);
CREATE INDEX idx_milestone_evidence_uploaded_by ON milestone_evidence(uploaded_by);
CREATE INDEX idx_milestone_evidence_active ON milestone_evidence(is_active);
```

#### Update Table: `milestones`

```sql
-- Add column untuk track evidence submission
ALTER TABLE milestones 
ADD COLUMN evidence_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN evidence_count INTEGER DEFAULT 0;
```

### 3.2 API Endpoints

#### POST `/api/milestones/[id]/evidence`

**Purpose:** Upload evidence untuk milestone tertentu

**Request Body (multipart/form-data):**
```typescript
{
  files?: File[],              // Array of files (max 5)
  links?: string[],            // Array of URLs
  linkTitles?: string[],       // Titles for each link
  description?: string,        // Optional description
  milestoneId: string          // UUID of milestone
}
```

**Response (200 OK):**
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
  }
}
```

**Error Responses:**
- 400: Invalid file type/size, invalid URL format
- 401: Unauthorized (not the assigned freelancer)
- 403: Milestone not in "In Progress" status
- 413: File too large
- 500: Upload failed

#### GET `/api/milestones/[id]/evidence`

**Purpose:** Retrieve all evidence untuk milestone tertentu

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
      uploaded_by: {
        id: string,
        full_name: string
      }
    }>
  }
}
```

#### DELETE `/api/milestones/evidence/[evidenceId]`

**Purpose:** Soft delete evidence (set is_active = false)

**Response (200 OK):**
```typescript
{
  success: true,
  message: "Evidence deleted successfully"
}
```

### 3.3 Supabase Storage Setup

#### Bucket Configuration

```typescript
// Bucket name: milestone-evidence
{
  public: false,
  fileSizeLimit: 10485760, // 10MB in bytes
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed'
  ]
}
```

#### Storage Policies (RLS)

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

### 3.4 Component Architecture

```
UploadEvidenceModal (Enhanced)
├── EvidenceTypeSelector (Tab: File / Link)
├── FileUploadZone
│   ├── DragDropArea
│   ├── FileList (preview selected files)
│   └── UploadProgress
├── LinkInputSection
│   ├── LinkInput (with validation)
│   └── LinkList (preview added links)
├── DescriptionInput (textarea)
└── SubmitButton

EvidenceReviewModal (New - for Client)
├── EvidenceList
│   ├── FileEvidence
│   │   ├── ImagePreview (with lightbox)
│   │   └── FileDownloadLink
│   └── LinkEvidence (clickable with icon)
├── DescriptionDisplay
└── ActionButtons (Approve / Request Revision)
```

---

## 4. User Flow

### 4.1 Freelancer Upload Flow

```
1. Freelancer navigates to Dashboard
2. Sees milestone card with status "In Progress"
3. Clicks "Upload Bukti" button
4. UploadEvidenceModal opens
5. Chooses evidence type:
   a. File Upload:
      - Drag & drop or click to select
      - See file preview
      - Can add multiple files
   b. Link:
      - Enter URL
      - Add optional title
      - Can add multiple links
6. Adds optional description
7. Clicks "Kirim Kemajuan"
8. System validates:
   - File type & size
   - URL format
   - At least 1 evidence present
9. Upload progress shown
10. Files uploaded to Supabase Storage
11. Metadata saved to database
12. Milestone status updated to "Waiting for Approval"
13. Success confirmation shown
14. Modal closes
15. Milestone card updates to show new status
```

### 4.2 Client Review Flow

```
1. Client navigates to Dashboard
2. Sees milestone card with status "Waiting for Approval"
3. Clicks "Review Submission" button
4. EvidenceReviewModal opens
5. Client sees:
   - All uploaded files (with preview/download)
   - All submitted links (clickable)
   - Description from freelancer
6. Client reviews the evidence
7. Client decides:
   a. Approve:
      - Clicks "Approve" button
      - Confirmation dialog
      - Status → "Approved"
      - Payment released
   b. Request Revision:
      - Clicks "Request Revision"
      - Adds revision notes
      - Status → "In Progress"
      - Freelancer notified
8. Modal closes
9. Milestone card updates
```

---

## 5. Implementation Tasks

### Phase 1: Backend & Storage (Priority: High)

- [ ] **Task 1.1:** Create `milestone_evidence` table
  - Write migration SQL
  - Add indexes
  - Test constraints

- [ ] **Task 1.2:** Setup Supabase Storage bucket
  - Create `milestone-evidence` bucket
  - Configure size limits & MIME types
  - Setup RLS policies

- [ ] **Task 1.3:** Create API endpoint: POST `/api/milestones/[id]/evidence`
  - Handle multipart/form-data
  - Validate files & links
  - Upload to Supabase Storage
  - Save metadata to database
  - Update milestone status
  - Error handling & rollback

- [ ] **Task 1.4:** Create API endpoint: GET `/api/milestones/[id]/evidence`
  - Fetch evidence with uploader info
  - Generate signed URLs for files
  - Return structured response

- [ ] **Task 1.5:** Create API endpoint: DELETE `/api/milestones/evidence/[id]`
  - Soft delete (set is_active = false)
  - Authorization check

### Phase 2: Frontend Components (Priority: High)

- [ ] **Task 2.1:** Enhance `UploadEvidenceModal`
  - Add file upload functionality (drag & drop)
  - Add multiple file support
  - Add link input with validation
  - Add file preview
  - Add upload progress indicator
  - Integrate with new API

- [ ] **Task 2.2:** Create `EvidenceReviewModal` component
  - Display all evidence
  - Image preview with lightbox
  - File download links
  - Link display with icons
  - Description display

- [ ] **Task 2.3:** Update `MilestoneManager` component
  - Show evidence count badge
  - Update button states based on status
  - Integrate upload modal

- [ ] **Task 2.4:** Update `ClientMilestoneCard` component
  - Add "Review Submission" button
  - Show evidence count
  - Integrate review modal

### Phase 3: Validation & Error Handling (Priority: Medium)

- [ ] **Task 3.1:** Client-side validation
  - File type validation
  - File size validation
  - URL format validation
  - Form validation

- [ ] **Task 3.2:** Server-side validation
  - MIME type check
  - File size check
  - URL validation
  - Authorization check

- [ ] **Task 3.3:** Error handling & user feedback
  - Toast notifications
  - Error messages
  - Retry mechanism
  - Loading states

### Phase 4: Testing & Polish (Priority: Medium)

- [ ] **Task 4.1:** Unit tests
  - API endpoint tests
  - Validation logic tests
  - Component tests

- [ ] **Task 4.2:** Integration tests
  - Upload flow end-to-end
  - Review flow end-to-end
  - Error scenarios

- [ ] **Task 4.3:** UI/UX polish
  - Animations
  - Responsive design
  - Accessibility (ARIA labels)
  - Loading states

---

## 6. Success Criteria

### Acceptance Criteria

✅ **AC-1:** Freelancer dapat upload file (PNG, JPG, PDF, ZIP) maksimal 10MB  
✅ **AC-2:** Freelancer dapat submit link eksternal dengan URL valid  
✅ **AC-3:** Freelancer dapat menambahkan deskripsi opsional  
✅ **AC-4:** Evidence tersimpan di Supabase Storage dengan aman  
✅ **AC-5:** Metadata evidence tersimpan di database dengan benar  
✅ **AC-6:** Milestone status otomatis berubah ke "Waiting for Approval" setelah submit  
✅ **AC-7:** Client dapat melihat semua evidence yang disubmit  
✅ **AC-8:** Client dapat preview gambar dan download file  
✅ **AC-9:** Client dapat klik link eksternal  
✅ **AC-10:** Client dapat approve atau request revision  
✅ **AC-11:** Error handling yang proper untuk semua edge cases  
✅ **AC-12:** Upload progress indicator ditampilkan  

### Performance Metrics

- File upload < 5MB: < 5 seconds
- Image preview load: < 2 seconds
- API response time: < 500ms
- Success rate: > 99%

---

## 7. Security Considerations

1. **File Upload Security**
   - Validate MIME type (not just extension)
   - Sanitize filename
   - Scan for malware (future enhancement)
   - Limit file size strictly

2. **Access Control**
   - Only assigned freelancer can upload
   - Only project owner (client) can view
   - Use RLS policies in Supabase

3. **URL Validation**
   - Validate URL format
   - Prevent XSS via malicious URLs
   - Consider URL shortener abuse

4. **Storage Security**
   - Private bucket (no public access)
   - Signed URLs with expiry
   - Proper RLS policies

---

## 8. Future Enhancements

- [ ] Support video files (MP4, MOV)
- [ ] Inline preview untuk PDF
- [ ] Markdown support untuk description
- [ ] Evidence versioning (track revisions)
- [ ] Bulk download (ZIP all evidence)
- [ ] Evidence comments/feedback dari client
- [ ] Email notification saat evidence disubmit
- [ ] Mobile app support
- [ ] OCR untuk extract text dari gambar
- [ ] AI-powered evidence validation

---

## 9. Dependencies

- Supabase Storage (already available)
- Supabase Database (already available)
- Next.js App Router (already available)
- Framer Motion (already available)
- Lucide Icons (already available)

---

## 10. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Large file upload timeout | High | Medium | Implement chunked upload, show progress |
| Storage quota exceeded | High | Low | Monitor usage, implement cleanup policy |
| Malicious file upload | Critical | Low | MIME validation, file scanning |
| Concurrent upload conflicts | Medium | Low | Use atomic transactions |
| Browser compatibility | Medium | Low | Test on major browsers, use polyfills |

---

**Last Updated:** 2026-05-13  
**Next Review:** After Phase 1 completion
