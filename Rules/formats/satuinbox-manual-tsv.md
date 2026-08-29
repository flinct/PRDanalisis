# SatuInbox Manual TSV Format (Test Format Adapter)

**Purpose:** Lock-in format file TSV manual `SatuInbox Test Case Scenario V2`. Loaded only when the user asks for a `.tsv` test case file following that template.

> Format-specific rules live here. Universal QA rigor (coverage, traceability, test data, automation readiness) live in the test-design core rule.

---

## TSV Output Principles

Every manual TSV test case must:
- follow the existing template structure exactly
- stay readable for testers and reviewers
- contain short, executable, repeatable steps
- contain observable expected results
- stay consistent with existing module files

## TSV Output vs Generic QA Fields

| Generic QA Field | TSV Field |
| ----- | ----- |
| `TC-ID` | `Test ID` |
| `Precondition` | `Pre-Condition` |
| `Steps` | `Steps` |
| `Expected Result` | `Expected Result` |
| Environment / execution status | `ENV` and per-environment status columns |

Jangan paksa metadata generic berikut ke TSV bila template tidak menyediakan field:
`Req ID`, `Level`, `Priority`, `Test Data`, `Postcondition`, `Automation Status`.

Jika user minta traceability/priority/test data/automation mapping, taruh di supporting document, bukan dengan memecah struktur TSV.

---

## TSV File Structure

Dua bagian utama:
1. Summary section di atas.
2. Repeated test case blocks.

### Summary Section Rules

- `total cases =` berisi total test case di file.
- Environment labels: `DEV`, `STAGGING`, `PROD`.
- Summary counts: `Passed`, `Failed`, `Need to test`, `On test`, `No Status`.
- Summary counts must match actual case statuses in the file.

### Test Case Block Structure (urutan field tetap)

1. `Test ID`
2. `Create at`
3. `created by`
4. `Tester`
5. `Scenario`
6. `Pre-Condition`
7. `DATE`
8. `Url`
9. `Description`
10. `ENV`
11. `Steps`
12. `test type`
13. `Status Response`
14. `Expected Result`
15. `Actual Result`
16. `Status`

Jangan ubah urutan field, label, atau layout block.

---

## TSV Field Writing Rules

### `Test ID`
- Unik per file.
- Stable module prefix. Recommended: `SIX-<MODULE>-001` (e.g. `SIX-AUTH-001`, `SIX-TICKET-001`).
- Jika file existing pakai pola lain (mis. `SIX-Test-001`), pertahankan konsisten dalam file.

### `Create at` / `DATE`
- Format tanggal konsisten per file. Safe: `DD/MM/YYYY`.
- `DATE` boleh kosong jika belum dieksekusi.

### `created by` / `Tester`
- `created by`: nama author, satu gaya konsisten.
- `Tester`: isi saat ada PIC; boleh kosong.

### `Scenario`
- Satu target validasi pendek dan spesifik.
- Satu test case = satu objective utama.

### `Pre-Condition`
- Starting state yang dibutuhkan, faktual bukan prosedural.
- Kosong jika tidak ada setup khusus.
- Buruk: `Open register page` / `Click submit`.

### `Url`
- Halaman/domain/endpoint utama. Pendek & relevan.
- Contoh: `dev-v2.satuinbox.com`, `/auth/register`, `/settings/team-member`.

### `Description`
- Objective satu kalimat, fokus perilaku yang diverifikasi.
- Pola: `Verify ...` atau `Try ...`.
- Konsisten dengan `Scenario`, `test type`, dan expected result.

### `ENV`
- Kolom environment: `DEV`, `Staging`, `Prod`.
- Isi status pada sel environment terkait.

### `Steps`
- Urut dan repeatable, mulai dengan action verb.
- Satu main action per step, input value eksplisit.

### `test type`
- `POSITIVE` atau `NEGATIVE`.

### `Status Response` / `Expected Result`
- List of observable checkpoints (outcome statement, bukan instruksi).
- Contoh benar: `System will display Error: "invalid email format"`.
- Contoh salah: `Check error` / `Make sure it works`.

### `Actual Result`
- Factual execution result; kosong jika belum dites.

### `Status`
- Vocab konsisten: `Passed`, `Failed`, `Need to Test`, `On Test`, `No Status`.
- Untuk header summary uppercase jika file existing memakainya (`PASSED`, `FAILED`, `NEED TO TEST`, `ON TEST`).

---

## TSV Granularity Rules

Split jadi test case terpisah ketika:
- validation rule berbeda
- main expected result berbeda
- precondition materially berbeda
- test type berubah positive ↔ negative

## TSV Language Rules

- Satu bahasa primer per file (existing examples: simple English).
- System terms / error messages boleh mengikuti bahasa produk.
- Kalimat pendek dan langsung.

## TSV Quality Checklist

Setiap test case:
- clear objective
- specific input/condition
- repeatable steps
- observable expected result
- unambiguous per-environment status

Hindari:
- overly generic scenario
- jumpy/incomplete steps
- unverifiable expected result
- satu test case mencakup banyak objective
- status naming tidak konsisten

## TSV Consistency Notes

- Pertahankan struktur template.
- Step numbering sequential.
- Status naming konsisten.
- Update `total cases` + top summary setelah add/change.
- Satu `Test ID` prefix per module per file.
