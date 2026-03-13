# Application Form Full Stack App

A simple full-stack application form using Node.js, Express, Prisma, Neon, Cloudinary, and Tailwind CSS.

## Setup Instructions

### 1. Accounts and API Keys

- **Neon Database**: Create an account at [neon.tech](https://neon.tech). Create a new project and copy the connection string (DATABASE_URL).
- **Cloudinary**: Create an account at [cloudinary.com](https://cloudinary.com). Get your Cloud Name, API Key, and API Secret.
- **Render**: Create an account at [render.com](https://render.com) for deployment.

### 2. Environment Variables

Update the `.env` file with your credentials:

```
DATABASE_URL="your_neon_database_url_here"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 3. Database Setup

Run the following command to push the schema to your database:

```bash
npx prisma db push
```

This will create the `Applicant` table in your Neon database.

### 4. Install Dependencies

```bash
npm install
```

> **Note:** `prisma generate` runs automatically as part of `npm install` via the `postinstall` script.

### 5. Run Locally

```bash
npm start
```

Visit `http://localhost:3000` for the form, and `http://localhost:3000/applications.html` to view submissions.

### 6. Deployment to Render

1. Push your code to a Git repository (e.g., GitHub).
2. Create a new Web Service on Render, connect your repo.
3. Set environment variables in Render's dashboard: DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
4. Set the Render build command to:

```bash
npm install
npx prisma db push
```

> **Note:** `prisma generate` now runs automatically via the `postinstall` npm script — you no longer need to add it to the Render build command.

5. Set the Render start command to:

```bash
npm start
```

6. Deploy.

The app will be live, and you can access the form and view applications.

## Verifying the Deployment

Once Render shows **"Deploy successful"**, confirm everything is working end-to-end:

### 1. Health check (server + database)

```bash
curl https://<your-render-service>.onrender.com/health
```

Expected response:
```json
{ "status": "ok", "database": "connected" }
```

If you see `"database": "unreachable"` check your `DATABASE_URL` environment variable in Render.

### 2. Fetch applications (GET /applications)

```bash
curl https://<your-render-service>.onrender.com/applications
```

Expected: an empty array `[]` (or a list of existing submissions).

### 3. Submit a test application (POST /submit)

```bash
curl -X POST https://<your-render-service>.onrender.com/submit \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "description=Deployment verification" \
  -F "image1=@/path/to/image1.jpg" \
  -F "image2=@/path/to/image2.jpg"
```

Expected: HTTP 201 with a JSON object containing the saved applicant record.

### 4. Open the frontend

Navigate to `https://<your-render-service>.onrender.com` in your browser to use the form, and to `/applications.html` to view all submissions.

## How It Works

- Frontend: HTML form with Tailwind CSS styling, JavaScript for form submission.
- Backend: Express server handles POST /submit (uploads images to Cloudinary, saves data to Neon via Prisma), GET /applications (fetches all applications).
- After submission, data is instantly saved to the database. You can view all applications at /applications.html or query the DB directly in Neon dashboard.

## Notes

- Images are uploaded to Cloudinary and URLs are stored in the database.
- The app serves static files from the `public` folder.
- For production, ensure environment variables are set securely.
