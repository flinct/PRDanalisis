# Auth — Page Selector Map (data-cy)

> **Kontrak `data-cy` untuk auth (omnichannel-satuinbox-fe).**
> Tujuan: SEMUA elemen auth diseleksi via `data-cy` (bukan `#id`, `role`, teks, atau class). `testIdAttribute = 'data-cy'` → `getByTestId('X')` = `[data-cy="X"]`.
> Konvensi: **`PascalCase-Hyphen`** (mengikuti `Keyword-Input`, `Login-Submit-Button`).
> Status: **`ADA`** = sudah ada di FE · **`DONE`** = ditambahkan pada perubahan ini · **`TAMBAH`** = masih perlu ditambahkan.
> Konstanta: `apps/omnichannel/constants/data-cypress.ts` → `DATA_CYPRESS_AUTH`.
> Terakhir diperbarui: 2026-06-15.

---

## 1. Login — `/login` (V2 `/id/login`)

| Elemen | `data-cy` | Status |
|---|---|---|
| Auth section root | `Auth-Section` | ADA |
| Logo | `Satuinbox-Logo` | ADA |
| Container login | `Login-Container` | ADA |
| Form login | `Login-Form` | ADA |
| Input username/email | `Keyword-Input` | ADA |
| Input password | `Password-Input` | ADA |
| Toggle show password | `Show-Password` | ADA |
| Remember me | `Remember-Me` | ADA |
| Tombol login | `Login-Submit-Button` | ADA |
| Link reset password | `Reset-Password-Link` | **DONE** |
| Link register | `Register-Link` | **DONE** |
| Error card login | `Auth-Error` | **DONE** *(unified error card; menggantikan rencana `Login-Error-Message`)* |
| Error username wajib | `Keyword-Required-Message` | TAMBAH *(pesan inline `<p>` di TextInputField)* |
| Error password wajib | `Password-Required-Message` | TAMBAH |

> Login sukses → redirect `/conversation/your-inbox`.

## 2. Register — `/register` (V2 `/id/register`)

| Elemen | `data-cy` | Status |
|---|---|---|
| Form register | `Register-Form` | **DONE** |
| Fullname | `Fullname-Input` | ADA |
| Username | `Username-Input` | ADA |
| Email | `Email-Input` | ADA |
| Phone | `Phone-Input` | ADA |
| Password | `Password-Input` | ADA |
| Konfirmasi password | `Re-Enter-Password-Input` | ADA |
| Tombol daftar | `Register-Submit-Button` | **DONE** |
| Link ke login | `Login-Link` | **DONE** |
| Error fullname/username/email/phone/password/konfirmasi | `*-Error-Message` | TAMBAH |
| Pesan sukses register | `Register-Success-Message` | TAMBAH |
| Tombol kirim ulang email | `Resend-Email-Button` | TAMBAH |

## 3. Reset Password — `/reset-password`

| Elemen | `data-cy` | Status |
|---|---|---|
| Form reset | `Reset-Password-Form` | **DONE** |
| Input email | `Email-Input` | **DONE** |
| Tombol kirim link | `Reset-Password-Submit-Button` | **DONE** |
| Link ke login | `Login-Link` | **DONE** |

## 4. Set New Password — `/set-new-password?token=…`

| Elemen | `data-cy` | Status |
|---|---|---|
| Form set password | `Set-New-Password-Form` | **DONE** |
| Input password | `Password-Input` | **DONE** |
| Tombol submit | `Set-New-Password-Submit-Button` | **DONE** |
| Error card | `Auth-Error` | **DONE** |

## 5. Verify Email — `/verification?token=…`

| Elemen | `data-cy` | Status |
|---|---|---|
| Tombol verifikasi email | `Verify-Email-Button` | **DONE** |

> Verifikasi sukses → redirect `/login`.

## 6. Logout (in-app — main side nav footer)

| Elemen | `data-cy` | Status |
|---|---|---|
| User menu (avatar popover) | `User-Menu` | **DONE** |
| Tombol logout | `Logout-Button` | **DONE** |

> Flow: klik `User-Menu` → popover → `Logout-Button` → redirect `/login`.

---

## 7. Onboarding — (masih TAMBAH, belum diinstrumentasi)

| Elemen | `data-cy` | Status |
|---|---|---|
| Nama perusahaan | `Company-Input` | TAMBAH |
| NIB | `NIB-Input` | TAMBAH |
| NPWP | `NPWP-Input` | TAMBAH |
| ID number | `ID-Number-Input` | TAMBAH |
| Upload file | `Onboarding-File-Upload` | TAMBAH |
| Tombol verifikasi email | `Verify-Email-Button` | TAMBAH |
| Tombol submit | `Onboarding-Submit-Button` | TAMBAH |
| Tombol keluar | `Onboarding-Exit-Button` | TAMBAH |
| Pesan error validasi | `Onboarding-Error-Message` | TAMBAH |

## 8. Member Management — `/settings/organization/members` (masih TAMBAH)

| Elemen | `data-cy` | Status |
|---|---|---|
| Judul halaman | `Member-Page-Title` | TAMBAH |
| Tombol tambah anggota | `Add-Member` | ADA |
| Tab Member/Invited | `Member-Tab-Active` / `Member-Tab-Invited` | TAMBAH (ganti `Tabs-0/1` index-based) |
| Search anggota | `Member-Search-Input` | TAMBAH |
| Baris anggota | `Member-Row` | TAMBAH |
| Badge status | `Member-Status-Badge` | TAMBAH |
| Menu titik tiga | `Member-Row-Menu-Button` | TAMBAH |
| Menu item: Nonaktifkan/Aktifkan/Ganti Peran/Shift/Password/Max Conv/Hapus | `Member-Menu-*` | TAMBAH |
| Modal konfirmasi + tombol konfirmasi/batal | `Member-Confirm-Modal` / `-Confirm-Button` / `-Cancel-Button` | TAMBAH |
| Toast hasil | `Member-Toast` | TAMBAH |
| Invite email input + kirim | `Member-Invite-Email-Input` / `Send-Invitation` | TAMBAH / ADA |

---

## Ringkasan

- **Sudah diterapkan (DONE pada perubahan ini):** semua flow inti auth — login links + error card, register form/submit/link, reset password (form/email/submit/link), set new password (form/input/submit), verify email, logout (user menu + logout).
- **Sudah ADA sebelumnya:** login inputs/form/submit/remember-me/container, register inputs, auth section root, logo, show-password.
- **Masih TAMBAH:** pesan validasi/error level-field (login & register), register success + resend, seluruh **Onboarding**, seluruh **Member Management**.
- Setelah `data-cy` di-build, page object di sixV2Automation tinggal pakai `getByTestId(...)` — lihat `auth.page.js`.
