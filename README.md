# PATS Portal

## Requirements

- Node.js 20+
- MySQL running locally (XAMPP)

## Setup

### 1. Clone and install
```bash
git clone <repo-url>
cd PATS
npm install
```

### 2. Configure environment
Place the `.env` file you received in the root of the project folder.

### 3. Create an empty database
Open phpMyAdmin and create a new empty database with the same name as in `DATABASE_URL` inside your `.env` file.

### 4. Setup database
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the app
```bash
npm run dev
```

### News PDF storage

PDF files for news posts are stored in `storage/news-pdfs/` (auto-created on `npm install`).

Never manually place PDFs in `public/` — use the admin UI to upload, or run:

```bash
npm run repair:pdfs
```
