# Local Hosting Guide (Windows PC)

## 1. Install Required Software

1. Install Node.js LTS (recommended v20+):
- https://nodejs.org/

2. Verify installation in new terminal:
- `node -v`
- `npm -v`

## 2. Open Project Folder

- `f:\AZM Labs\MP Website\syeed-jahangir-mp-web`

## 3. Install Dependencies

```powershell
npm install
```

## 4. Configure Environment

1. Duplicate `.env.example` as `.env.local`
2. Add SMTP credentials if you want email alerts from Write-to-MP form

Example:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_FROM=you@example.com
CONTACT_EMAIL_TO=office@example.com
```

## 5. Run in Development Mode

```powershell
npm run dev
```

Open:
- `http://localhost:3000/bn`
- `http://localhost:3000/en`

## 6. Default Admin Access

- `http://localhost:3000/bn/admin/login`
- Username: `admin`
- Password: `ChangeMe123!`

After first login, create your own admin user and stop using the default account.

## 7. Build for Production (Local)

```powershell
npm run build
npm run start
```

App will run on port 3000 by default.

## 8. Data Files Generated Automatically

On first run, these files are created under project root `data/`:
- `site-content.json`
- `users.json`
- `submissions.json`
- `sessions.json`

Uploaded media files are saved in:
- `public/uploads/images`
- `public/uploads/videos`
- `public/uploads/pdfs`

Back up this `data` folder regularly.

## 9. Troubleshooting

1. `node` command not found:
- Node.js is not installed or terminal needs restart.

2. Email not sending:
- Recheck SMTP values in `.env.local`
- Ensure provider allows SMTP/app passwords.

3. Site opens but no styling:
- Stop server, run `npm install`, then `npm run dev` again.

4. Cannot login to admin:
- Check `data/users.json` exists and contains default `admin`.

## 10. Security Checklist

1. Change default admin credentials immediately.
2. Keep `.env.local` private.
3. Do not commit `data/` or `.env.local` to public git.
4. Use strong SMTP password or app-specific password.
