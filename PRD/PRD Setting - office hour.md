# Office Hours (Organization)

## Introduction

| Aspek | Detail |
| ----- | ----- |
| **Feature Name** | Office Hours |
| **Objective** | Memungkinkan admin menentukan jam operasional resmi (Office Hours) yang akan ditampilkan ke customer agar mereka tahu kapan tim support tersedia untuk dihubungi. |
| **Target Audience** | Customer Support Admin, Customer |
| **Scope** | \- Admin dapat mengatur jam operasional default (Office Hours) per hari.- Office Hours ditampilkan ke customer di widget/chat/informasi otomatis.- Sistem mengatur status *available/away* berdasarkan Office Hours default.- Tidak mencakup jam kerja individu (Working Hours). |

---

1. ## User Stories

| ID | User | Story |
| ----- | ----- | ----- |
| US-OH-01 | Admin | Sebagai Admin, saya ingin dapat mengatur Office Hours per hari agar customer tahu kapan support tersedia. |
| US-OH-02 | Admin | Sebagai Admin, saya ingin dapat memilih format waktu (12h AM/PM atau 24h) untuk menampilkan Office Hours sesuai preferensi tim. |
| US-OH-03 | Admin | Sebagai Admin, saya ingin dapat membatasi jumlah interval per hari agar konfigurasi lebih mudah dipahami. |
| US-OH-04 | Customer | Sebagai Customer, saya ingin melihat informasi Office Hours agar saya tahu kapan harus menghubungi tim support. |
| US-OH-05 | System | Sebagai sistem, saya ingin secara otomatis menandai status “outside office hours” agar dapat memicu auto-reply. |

2. ## Acceptance Criteria

| ID | Feature | Criteria | Pass/Fail Condition |
| ----- | ----- | ----- | ----- |
| AC-OH-01 | Office Hours Setup | Admin dapat menambahkan jadwal Office Hours per hari. | Jam operasional per hari tersimpan dan muncul di UI. |
| AC-OH-02 | Multiple Interval | Admin dapat menambahkan maksimal **4 interval waktu per hari**. | Jika lebih dari 4, sistem menolak input dan menampilkan error message. |
| AC-OH-03 | Time Format | Admin dapat memilih format waktu (12h atau 24h). | Office Hours muncul sesuai format yang dipilih. |
| AC-OH-04 | Customer Display | Customer dapat melihat Office Hours di widget/chat. | Informasi tampil sesuai dengan pengaturan admin. |
| AC-OH-05 | Outside Hours Status | Sistem dapat mendeteksi jika chat masuk di luar Office Hours. | Status otomatis berubah ke “outside office hours” dan trigger auto-reply. |

3. ## Functional Requirements

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-OH-01 | Admin dapat menambahkan, mengedit, dan menghapus Office Hours per hari. | High |
| FR-OH-02 | Sistem harus mendukung lebih dari satu interval waktu per hari (maksimal 4). | High |
| FR-OH-03 | Admin dapat memilih format waktu (12h AM/PM atau 24h). | Medium |
| FR-OH-04 | Office Hours harus dapat ditampilkan ke customer melalui widget/chat. | High |
| FR-OH-05 | Sistem harus memicu status *outside office hours* untuk auto-reply. | High |

4. ## Non-Functional Requirements

| ID | Category | Description |
| ----- | ----- | ----- |
| NFR-OH-01 | Performance | Sistem harus memproses penjadwalan dan menampilkan Office Hours \< 1 detik. |
| NFR-OH-02 | Usability | UI Office Hours harus mudah dipahami, dengan opsi tambah interval per hari (max 4). |
| NFR-OH-03 | Availability | Office Hours harus konsisten muncul di semua channel (widget, chat, API). |
| NFR-OH-04 | Compatibility | Mendukung format waktu global (12h & 24h). |

5. ## System Flow

### a. Admin Setup Flow

1. Admin membuka halaman **Settings → Office Hours**.

2. Admin memilih hari dalam seminggu.

3. Admin menambahkan interval jam (misalnya 09:00–12:00, 13:00–18:00).  
   * Sistem membatasi maksimum **4 interval per hari**.  
   * Jika admin mencoba menambah interval ke-5, sistem menampilkan pesan error: *“You can only add up to 4 intervals per day.”*

4. Admin memilih format waktu (12h atau 24h).

5. Admin menyimpan pengaturan.

6. Sistem menyimpan Office Hours sebagai default operasional.

### b. Customer Experience Flow

1. Customer membuka widget/chat.

2. Sistem menampilkan **Office Hours** yang sudah diatur.

3. Jika customer mengirim pesan di luar Office Hours:  
   * Sistem menandai status “outside office hours”.  
   * Auto-reply dikirim (jika diaktifkan).

6. ## Auto-Merge Overlap Office Hours

1. **Overlap Intervals**

   * If two intervals partially overlap, the system will automatically merge them into a single wider interval.  
   * **Example:**  
     * Interval A: 09:00 – 12:00  
     * Interval B: 11:00 – 14:00  
     * **Result:** 09:00 – 14:00

2. **Contained Intervals**  
   * If one interval is fully contained within another, the smaller interval will be discarded.  
   * **Example:**  
     * Interval A: 12:00 AM – 06:00 PM  
     * Interval B: 09:00 AM – 06:00 PM  
     * **Result:** 12:00 AM – 06:00 PM

3. **Duplicate Intervals**  
   * If two intervals are identical, only one will be kept.  
   * **Example:**  
     * Interval A: 09:00 – 18:00  
     * Interval B: 09:00 – 18:00  
     * **Result:** 09:00 – 18:00

### **System Behavior**

* Auto-merge occurs **on Save** when the Admin finalizes Office Hours settings.

* The resulting intervals are displayed back to the Admin immediately to maintain transparency.  
* A success notification will include a helper message if merging occurs:  
  * *“Some overlapping intervals were merged to avoid redundancy.”*

### **Benefits**

* Ensures Office Hours are always logically consistent.

* Prevents redundant data that could confuse Admins, Customers, or reporting systems.  
* Provides a smoother Admin experience by reducing manual error correction.

7. ## Data Fields

| Field Name | Type | Description | Example |
| ----- | ----- | ----- | ----- |
| office\_hours\_id | Integer | Unique ID for office hours config | 12345 |
| day | Enum | Day of the week (Mon–Sun) | “Monday” |
| intervals | Array (max 4\) | List of time intervals per day | \[{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}\] |
| time\_format | Enum | Time display format (12h/24h) | "24h" |
| created\_at | DateTime | When config was created | "2025-09-22T09:00:00Z" |
| updated\_at | DateTime | Last updated timestamp | "2025-09-22T09:30:00Z" |

