# Admin Videos UI Design

## Goal

Add an admin video management page that lets an authenticated admin upload large production-house video files directly to Cloudinary with signed upload parameters and save video metadata to MongoDB.

## Scope

This slice adds `/admin/videos`. It does not implement full brand/project CRUD forms yet. It uses existing project records from `GET /api/admin/projects` so uploaded videos can be assigned to a project.

## Flow

1. Admin opens `/admin/videos`.
2. The page redirects to `/admin/login` if no admin token exists.
3. The page loads existing videos and projects.
4. Admin selects a video file and fills title, project, display order, and publish state.
5. Frontend calls `POST /api/admin/uploads/signature` with `{ resourceType: 'video' }`.
6. Browser uploads the selected file directly to Cloudinary using the signed parameters.
7. Cloudinary returns `secure_url` and `public_id`.
8. Frontend calls `POST /api/admin/videos` with the video metadata.
9. The list refreshes.

## UI

The admin UI should be operational, dense, and clear. It should not look like the public landing page. It uses a light background, simple cards, compact forms, and explicit upload status.

## Error Handling

The page displays a clear error when loading data, signing upload, direct Cloudinary upload, or metadata save fails. Upload progress should be visible while the video is uploading.
