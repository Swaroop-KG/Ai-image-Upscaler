# AI Image Upscaler

AI Image Upscaler is a full-stack web app for upscaling and enhancing images with an AI-like workflow.
Users can upload an image, choose an upscale factor (2x or 4x), see processing states, compare
before/after, and download the upscaled result. Authenticated users get a persistent history
backed by Supabase.

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui + lucide-react
- **Auth**: NextAuth.js (credentials provider)
- **Database**: Supabase
- **Deployment**: Render
- API KEY From: clipdrop apis

The app currently uses a **mock AI upscaler** that simulates processing and returns configurable
static images. The architecture is ready to be swapped to a real AI upscaling API.

---
## Login 
email:user@gmail.com
password:demo123


### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```bash
NEXTAUTH_SECRET=your-long-random-secret
NEXTAUTH_URL=http://localhost:3000

# Supabase (required for history persistence)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Simple demo password for credentials auth
DEMO_PASSWORD=demo123

# Optional: real AI upscaling provider
REAL_UPSCALE_API_KEY=your-upscaler-api-key
```

> If Supabase variables are missing, the app still works, but history will be disabled.

### 3. Supabase schema

In your Supabase SQL editor, create the `upscaled_images` table:

```sql
create table if not exists public.upscaled_images (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  original_url text not null,
  upscaled_url text not null,
  upscale_factor integer not null,
  original_width integer not null,
  original_height integer not null,
  upscaled_width integer not null,
  upscaled_height integer not null,
  created_at timestamptz not null default now()
);
```

You can adjust `user_id` to `uuid` if you align it with your NextAuth user model.

### 4. Real upscaling API key

Set `REAL_UPSCALE_API_KEY` in your `.env.local` (Clipdrop API key expected). Without it, the app falls back to simple resizing via `sharp`.

```
REAL_UPSCALE_API_KEY=your_clipdrop_api_key_here
```

### 5. Mock upscaled assets

Place your mock images in `public/mock`:

- `public/mock/upscaled-2x.png`
- `public/mock/upscaled-4x.png`

These paths are configured in `src/lib/upscale/config.ts`:

```ts
export const SUPPORTED_UPSCALE_FACTORS = [2, 4] as const;
export const DEFAULT_UPSCALE_FACTOR = SUPPORTED_UPSCALE_FACTORS[0];

export const MOCK_UPSCALED_IMAGES: Record<number, string> = {
  2: "/mock/upscaled-2x.png",
  4: "/mock/upscaled-4x.png",
};
```

You can swap these to any images you like.

### 6. Run the dev server

```bash
npm run dev
```

Then open http://localhost:3000.

---

## App Features

### Landing / Upload page (`/`)

- Drag-and-drop upload (PNG, JPG/JPEG, WebP; max 10MB)
- Upscale factor selection (2x, 4x) via `UpscaleOptions`
- Clear processing state component while the image is being "upscaled"
- Before/after comparison with resolution summary and download button
- Error handling for:
  - No file selected
  - Unsupported formats
  - File too large
  - Server-side upscaling errors

### Dashboard (`/dashboard`)

- Protected route; requires login
- Shows a grid of historical upscales from Supabase:
  - Thumbnail of the upscaled image
  - Original → upscaled resolutions
  - Chosen upscale factor
  - Timestamp
  - Download button

---

## Auth (NextAuth + credentials)

- Configured in `src/lib/auth/options.ts` and wired via
  `src/app/api/auth/[...nextauth]/route.ts`.
- Uses a simple **credentials** provider:
  - Email + password form
  - Password must match `DEMO_PASSWORD` (default `demo123`).
- Session is JWT-based; `session.user.id` is available on the server and client.
- Navbar shows a Login/Signup button or Logout + current email.

For a production setup, you can replace the credentials provider with real OAuth or Supabase
Auth while keeping the rest of the app unchanged.

---

## Image Upscaling Flow

### Frontend

- `UploadDropzone` handles drag-and-drop and validation hints.
- `UpscaleOptions` exposes the configured upscale factors.
- Main page (`src/app/page.tsx`):
  - Manages selected file, factor, loading state, and result.
  - POSTs to `/api/upload` with a `FormData` payload.
  - Uses `sonner` toasts + inline alerts for errors.

### Backend: `/api/upload`

Implemented in `src/app/api/upload/route.ts`:

1. Parses `multipart/form-data` using `request.formData()`.
2. Validates content type and size.
3. Writes the original image to `public/uploads/<uuid>.<ext>`.
4. Uses `image-size` to compute original width/height.
5. Calls `upscaleImage` from `src/lib/upscale/upscaleImage.ts` (mock implementation):
   - Simulates delay
   - Returns a mock upscaled URL and computed resolution.
6. If the user is authenticated, persists a history row in Supabase.
7. Returns JSON with `UpscaleResult` (original/upscaled URLs and dimensions).

To integrate a **real AI upscaler**, replace the logic in `upscaleImage` to call your preferred
Clipdrop API and use the config module `src/lib/upscale/config.ts` to pull API
keys and model IDs from env vars.

---


## Assumptions

- The AI upscaling is mocked locally via static assets until a real provider is wired in.
- Supabase is used only for user history; authentication is handled by NextAuth credentials.
- Image uploads are stored on the app filesystem under `public/uploads`. In a multi-instance or
  long-lived production environment, you should switch this to cloud storage (e.g. Supabase
  Storage or S3).
- The history feature gracefully degrades if Supabase env vars are missing (no history, no crash).
