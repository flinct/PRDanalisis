# Google Docs Integration — Setup (QA Browser)

QA Browser (`Test/testcase-browser.html` + `server.js`) terhubung ke Google lewat **OAuth
login** (akun Google kamu sendiri). Fitur:

- **Baca** Google Docs di sidebar (section "Google Docs").
- **Export** markdown apa pun → Google Doc baru (basic styled).
- **Mirror otomatis**: setiap file `.md` di folder `PRD/` di-push jadi Google Doc, dan
  **otomatis update** tiap kamu simpan / generate file baru.

Semua dokumen tersimpan di **Drive akun kamu** — tidak perlu share folder ke siapa pun.

---

## 1. Aktifkan API di Google Cloud

1. Buka <https://console.cloud.google.com> → pilih / buat Project.
2. **APIs & Services → Library** → enable:
   - **Google Docs API**
   - **Google Drive API**

## 2. OAuth consent screen

1. **APIs & Services → OAuth consent screen** → User Type **External** → Create.
2. Isi nama app + email. Save.
3. Di bagian **Test users**, tambahkan email Google kamu (akun yang akan login).
   (Selama app "Testing", hanya test user yang boleh login — itu cukup.)

## 3. Buat OAuth Client ID

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URIs** → tambahkan persis:
   ```
   http://localhost:3001/oauth2callback
   ```
   (Kalau `PORT` kamu beda, sesuaikan angkanya.)
4. Create → **Download JSON**.

## 4. Simpan kredensial

Taruh file JSON yang di-download sebagai **`oauth-credentials.json`** di root project
(`PRDanalisis/`). Atau set via `.env`:

```
GOOGLE_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxxx
# opsional kalau port beda:
GOOGLE_OAUTH_REDIRECT=http://localhost:3001/oauth2callback
```

> `oauth-credentials.json`, `google-token.json`, dan `.env` sudah masuk `.gitignore` — jangan commit.

## 5. (Opsional) Folder mirror

Default: mirror dibuat di folder Drive bernama **`PRD`** (otomatis dibuat di My Drive kamu).
Untuk pakai folder lain, set salah satu di `.env`:

```
GDRIVE_FOLDER_NAME=PRD            # cari/buat folder dengan nama ini
# atau
GDRIVE_FOLDER_ID=1AbC...          # ID folder spesifik (dari URL Drive)
```

## 6. Jalankan & login

```bash
npm install      # menarik googleapis
npm start
```

1. Buka <http://localhost:3001> → klik **⚙ (Settings)** di pojok kanan atas.
2. Section **Google Connection** → **Login with Google** → pilih akun → Allow.
3. Setelah connect, halaman kembali ke app. Buka Settings lagi → status **✓ Connected**.

---

## Cara pakai

- **Baca:** sidebar section *Google Docs* → mirror isi folder Drive (atau daftar semua Doc).
- **Export sekali:** buka file `.md` → toolbar **⇪ Export to GDocs** → buat Doc baru.
- **Mirror semua PRD:** Settings → **⇪ Mirror all PRD now**.
- **Auto-update:** begitu server jalan + sudah login, tiap `.md` di `PRD/` yang berubah/baru
  otomatis di-push ke Doc-nya (file watcher, debounce ~1.2 dtk).

## Halaman Settings (⚙)

1. **Google Connection** — login/logout, status akun, tombol mirror.
2. **Theme** — pilih dari 6 tema.
3. **Manual Import** — re-scan & reindex TSV/MD ke database.

## Endpoint server (referensi)

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/google/status` | GET | `{oauthConfigured, connected, email, folderName}` |
| `/api/google/login` | GET | Redirect ke Google consent |
| `/oauth2callback` | GET | Tukar code → simpan token |
| `/api/google/logout` | POST | Hapus token |
| `/api/mirror` | POST | Mirror semua `PRD/*.md` → Docs |
| `/api/gdocs` | GET | Tree dokumen (mirror folder / daftar flat) |
| `/api/gdocs/:id` | GET/PUT | Baca / update doc |
| `/api/gdocs` | POST | Buat doc baru `{title, content}` |

## Catatan & batasan

- Mirror **satu arah** (lokal → Google Docs). Edit di Google Docs **tidak** ditarik balik ke file lokal.
- Konversi markdown → Docs: heading (`#`..`######`), `**bold**`, bullet (`-`/`*`), dan
  `[teks](url)`. Tabel & format kompleks lain belum di-render penuh.
- State mirror disimpan di `.gdocs-mirror.json` (peta path lokal → docId + hash). Hapus file
  ini kalau mau mirror ulang dari nol.
- Token Google tersimpan lokal di `google-token.json`. Hapus = sama dengan logout.
