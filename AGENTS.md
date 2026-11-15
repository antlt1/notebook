# AGENTS.md — Dự án **GhiChu Notebook**

> **Trạng thái tài liệu:** `v1.0` — **Phase 0 đã chốt** (2026-11-14, xem Mục 14–15). Các quyết định trong file là **đã chốt**, trừ mục còn gắn `⚠️`.
> **Ngôn ngữ làm việc:** Giao tiếp với chủ dự án bằng **tiếng Việt**. Code, tên biến, commit message dùng **tiếng Anh**.
> **Đối tượng đọc:** AI coding agent (Claude Code, Cursor, Codex, Copilot Agent…) và con người.

---

## 0. Cách dùng file này (đọc trước khi làm bất cứ việc gì)

1. Đọc **toàn bộ** file này trước khi viết dòng code đầu tiên.
2. Mục gắn nhãn `⚠️ CẦN XÁC NHẬN` là **đề xuất**, chưa phải quyết định cuối. Không coi là đã chốt cho đến khi chủ dự án trả lời.
3. Gặp chỗ mơ hồ ảnh hưởng đến thiết kế → **hỏi, đừng đoán** (xem Mục 10).
4. Khi chủ dự án chốt một quyết định → agent ghi vào **Mục 15 (Decision Log)** và đổi nhãn thành `✅ ĐÃ CHỐT`.
5. Nếu code và file này mâu thuẫn nhau → **dừng lại và hỏi**, không tự chọn bên nào.

---

## 1. Tổng quan dự án

**GhiChu Notebook** là ứng dụng web ghi chú cá nhân. Người dùng đăng nhập, tạo nhiều ghi chú; mỗi ghi chú có nhiều **tab**; nội dung mỗi tab được soạn trong một trình soạn thảo kiểu **Markdown editor** (gõ `#`, `##`, `###`, `####` ra heading, định dạng đẹp, lưu tự động).

| Hạng mục | Nội dung |
|---|---|
| Mục tiêu | Ghi chú nhanh, đẹp, đồng bộ mọi thiết bị, an toàn dữ liệu |
| Người dùng | Cá nhân; mỗi người **chỉ thấy ghi chú của mình** |
| Backend | Firebase: **Authentication** + **Cloud Firestore** (project `db-ghichu`) |
| Nền tảng | Web (responsive: desktop + mobile), có thể cài như PWA ở giai đoạn sau |
| Nguyên tắc | Nhanh · Gọn · Viết là lưu · Đẹp khi đọc · Không mất dữ liệu |

**Ngoài phạm vi MVP (non-goals):** cộng tác realtime nhiều người, chia sẻ link công khai, app native, tính năng AI, upload ảnh/file. (Có thể đưa vào Backlog — Mục 11.)

---

## 2. Tính năng

### MVP (Phase 1–7)
- [ ] Đăng ký / đăng nhập / đăng xuất / quên mật khẩu (Email + Password, Google)
- [ ] Danh sách ghi chú (sidebar): tạo, đổi tên, xoá (có xác nhận), tìm theo tiêu đề, sắp xếp theo `updatedAt`
- [ ] Mỗi ghi chú có **nhiều tab**: thêm, đổi tên (double-click), xoá, kéo-thả đổi thứ tự
- [ ] Editor: heading **H1–H4**, đoạn văn, **đậm / nghiêng / gạch ngang / code inline**, danh sách (•, 1., ☐ checklist), trích dẫn, code block, đường kẻ, link
- [ ] Gõ cú pháp Markdown (`# `, `## `, `- `, `1. `, `> `, ``` ``` ```, `---`, `[] `) → tự chuyển thành định dạng
- [ ] Toolbar nổi + menu `/` (slash command)
- [ ] **Tự động lưu** (debounce) + trạng thái "Đang lưu… / Đã lưu / Lỗi"
- [ ] Realtime sync giữa các thiết bị (`onSnapshot`)
- [ ] Offline cơ bản (Firestore persistent cache)
- [ ] Dark / Light mode, responsive, trạng thái loading / empty / error đầy đủ
- [ ] Xuất tab ra file `.md`

### Phase 2 (sau MVP) — ⚠️ CẦN XÁC NHẬN thứ tự ưu tiên
- Chế độ xem: **Soạn thảo / Markdown thô / Xem trước**
- Outline (mục lục tự sinh từ H1–H4) ở panel phải
- Ghim ghi chú, thùng rác (soft delete), tag
- Bảng (table), tìm kiếm trong nội dung
- Lịch sử phiên bản, PWA, upload ảnh (cần Firebase Storage)

---

## 3. Công nghệ — ✅ ĐÃ CHỐT (2026-11-14)

| Lớp | Đề xuất (mặc định) | Lý do | Phương án thay thế |
|---|---|---|---|
| Ngôn ngữ | **TypeScript** (`strict: true`) | Bắt lỗi sớm, schema rõ ràng | JavaScript |
| Framework | **React + Vite** (SPA) | Firebase chạy phía client, không cần SSR; build nhanh | Next.js (nếu cần SEO/SSR), Vue, Svelte |
| Routing | **React Router** | Phổ biến, đủ dùng | TanStack Router |
| UI | **Tailwind CSS + shadcn/ui + lucide-react** | Đẹp, dễ tuỳ biến, không khoá thư viện | MUI, Mantine |
| Editor | **Tiptap** (nền ProseMirror) | WYSIWYG, gõ `#` ra heading như MD editor, dễ mở rộng | Milkdown (markdown-native), BlockNote (kiểu Notion), CodeMirror 6 (markdown thô + preview) |
| Style nội dung | **@tailwindcss/typography** (`prose`) | Heading/list/quote/code đẹp sẵn, tuỳ biến được | CSS tay |
| State | React Context + **Zustand** (state UI nhỏ) | Nhẹ, đơn giản | Redux Toolkit (thừa cho dự án này) |
| Auth / DB | **Firebase Auth + Cloud Firestore** | Bạn đã chọn | — |
| Hosting | **Firebase Hosting** | Cùng project, 1 lệnh deploy | Vercel, Netlify |
| Test | **Vitest + React Testing Library**, **Firebase Emulator** + `@firebase/rules-unit-testing` | Test được cả Security Rules | Jest |
| Lint/Format | **ESLint + Prettier** | Chuẩn chung | Biome |
| Package manager | **npm** | Máy đã có sẵn, không cần cài thêm công cụ | pnpm, yarn |

> **Về phiên bản:** dùng bản ổn định mới nhất tại thời điểm cài. Agent **PHẢI** kiểm tra tài liệu chính thức / npm trước khi dùng API của Tiptap, Firebase SDK, Tailwind, shadcn/ui — các thư viện này đổi API khá nhiều giữa các bản major. **Không viết API theo trí nhớ.** Không chắc → nói rõ là không chắc và hỏi/tra cứu.

---

## 4. Firebase

### 4.1 Dịch vụ cần bật trong Firebase Console (project `db-ghichu`)
- [ ] **Authentication** → Sign-in method: Email/Password + Google
- [ ] **Authentication → Settings → Authorized domains**: thêm domain deploy thật (localhost có sẵn)
- [ ] **Cloud Firestore**: tạo database, **chọn production mode (KHÔNG chọn test mode)**
- [ ] **Hosting** (khi deploy)
- [ ] (Khuyến nghị) **App Check** + giới hạn API key theo HTTP referrer trong Google Cloud Console
- [ ] (Khuyến nghị) Đặt **Budget alert** trong Google Cloud để tránh phát sinh chi phí ngoài ý muốn

### 4.2 Biến môi trường — file `.env.local` (đã có trong `.gitignore`)

```env
VITE_FIREBASE_API_KEY=AIzaSyAAtF8_ZcWJK8P6wBzexAVJ23coupkME3o
VITE_FIREBASE_AUTH_DOMAIN=db-ghichu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=db-ghichu
VITE_FIREBASE_STORAGE_BUCKET=db-ghichu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=346417565582
VITE_FIREBASE_APP_ID=1:346417565582:web:2197ad4c74f3938fe81edf
VITE_FIREBASE_MEASUREMENT_ID=G-KLE4B8EHYS
VITE_USE_FIREBASE_EMULATOR=true
```

> `VITE_USE_FIREBASE_EMULATOR=true` → Auth trỏ `127.0.0.1:9099`, Firestore trỏ `127.0.0.1:8080`. Đặt `false`/bỏ trống để dùng Firebase thật. `VITE_FIREBASE_MEASUREMENT_ID` đã bỏ khỏi config vì MVP không dùng Analytics (Q14).

> **Lưu ý bảo mật:** Firebase web `apiKey` **không phải bí mật** (nó nằm trong bundle JS công khai nào cũng thấy). Thứ thực sự bảo vệ dữ liệu là **Security Rules** (Mục 6) + App Check. Dù vậy: **không hardcode vào source**, **không commit `.env*`**, và cung cấp file `.env.example` (giá trị rỗng) cho repo.

### 4.3 Khởi tạo — `src/lib/firebase.ts`

```ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Offline cache (IndexedDB), dùng được nhiều tab trình duyệt cùng lúc — ✅ Q12: bật
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// ✅ Q14: KHÔNG dùng Firebase Analytics ở MVP.
```

> Agent kiểm tra lại API `initializeFirestore` / `persistentLocalCache` theo docs của bản Firebase SDK đang cài trước khi dùng.

---

## 5. Mô hình dữ liệu Firestore — ✅ ĐÃ CHỐT (2026-11-14)

### 5.1 Ánh xạ từ yêu cầu ban đầu

| Yêu cầu của bạn | Tên trong code | Ghi chú |
|---|---|---|
| `noteID` | `id` (= Document ID) | Auto-ID của Firestore, không lưu thành field riêng |
| `userID` | `userId` | = `auth.currentUser.uid` |
| `datecreate` | `createdAt` | `Timestamp`, dùng `serverTimestamp()` |
| `title` | `title` | string, ≤ 200 ký tự |
| `tab [{nametab}, …]` | `tabs[]` | mảng object, mỗi tab có `id`, `name`, `value`, `order` |
| `value` | `tabs[i].value` | ✅ Q5: nội dung thuộc **từng tab** |
| *(thêm)* | `updatedAt` | để sắp xếp danh sách + hiển thị "sửa lần cuối" |

### 5.2 Collection `notes/{noteId}`

```ts
import type { Timestamp } from "firebase/firestore";

export interface NoteTab {
  id: string;      // crypto.randomUUID() — ổn định, dùng làm React key
  name: string;    // ≤ 50 ký tự
  value: string;   // nội dung Markdown — ✅ Q4: lưu Markdown string
  order: number;   // thứ tự hiển thị, 0..n
}

export interface Note {
  id: string;              // doc id (không nằm trong data)
  userId: string;          // uid chủ sở hữu — BẤT BIẾN sau khi tạo
  title: string;           // ≤ 200 ký tự
  tabs: NoteTab[];         // ≤ 30 tab
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Ví dụ document:

```json
{
  "userId": "u_abc123",
  "title": "Kế hoạch tuần này",
  "tabs": [
    { "id": "7f1c…", "name": "Việc cần làm", "value": "# Thứ Hai\n- [ ] Gửi báo cáo\n", "order": 0 },
    { "id": "a92e…", "name": "Ý tưởng",      "value": "## Ý tưởng app\n> Viết là lưu.\n", "order": 1 }
  ],
  "createdAt": "<serverTimestamp>",
  "updatedAt": "<serverTimestamp>"
}
```

Tạo note mới → mặc định có 1 tab: `{ name: "Tab 1", value: "", order: 0 }`.

### 5.3 Đánh đổi của thiết kế "tab nhúng trong document" (A) vs "subcollection" (B)

> **✅ ĐÃ CHỐT (Q6): A — nhúng `tabs[]`** cho MVP. Bảng dưới giữ lại để tham khảo khi nâng cấp.

| | **A — nhúng `tabs[]` (✅ đã chốt)** | **B — `notes/{id}/tabs/{tabId}`** |
|---|---|---|
| Độ phức tạp | Thấp, khớp schema bạn mô tả | Cao hơn (ghi nhiều nơi, dùng batch) |
| Giới hạn | **1 MiB / document** (tổng mọi tab) | Mỗi tab 1 MiB riêng |
| Tải danh sách | Sidebar tải luôn nội dung mọi tab (nặng nếu nhiều note dài) | Chỉ tải metadata, mở note mới tải nội dung tab |
| Autosave | Ghi lại cả mảng `tabs` | Chỉ ghi đúng 1 tab |

**✅ Đã chốt:** làm A cho MVP (nhanh, đủ dùng cho ghi chú dạng text), cảnh báo khi dung lượng note > ~700 KB, và để dành đường nâng cấp sang B. Truy cập dữ liệu **chỉ qua `services/noteService.ts`** để sau này đổi B không phải sửa UI.

### 5.4 Service API (dự kiến, chốt chi tiết khi làm Phase 3)

```ts
subscribeNotes(uid, onData, onError): Unsubscribe // query where userId==uid orderBy updatedAt desc
createNote(uid, title?): Promise<string>           // trả về noteId
renameNote(noteId, title): Promise<void>
saveTabs(noteId, tabs): Promise<void>              // updateDoc + updatedAt: serverTimestamp()
deleteNote(noteId): Promise<void>
```

---

## 6. Security Rules & Index

### 6.1 `firestore.rules` — chặn mọi truy cập trừ chủ sở hữu

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    function validNote(d) {
      return d.keys().hasAll(['userId', 'title', 'tabs', 'createdAt', 'updatedAt'])
        && d.userId is string
        && d.title is string && d.title.size() <= 200
        && d.tabs is list && d.tabs.size() <= 30;
    }

    match /notes/{noteId} {
      allow read:   if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId) && validNote(request.resource.data);
      allow update: if isOwner(resource.data.userId)
                    && request.resource.data.userId == resource.data.userId   // không đổi chủ
                    && validNote(request.resource.data);
      allow delete: if isOwner(resource.data.userId);
    }

    // Mặc định: từ chối tất cả path khác
  }
}
```

> Query danh sách **bắt buộc** có `where("userId", "==", uid)` thì rule `read` mới cho qua. Agent phải **test rules bằng Emulator** (user A không đọc/sửa/xoá được note của user B; user chưa đăng nhập bị chặn).
> **Cấm** dùng `allow read, write: if true;` hoặc test mode — kể cả "tạm thời".

### 6.2 `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 6.3 `firebase.json`

```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true }
  }
}
```

---

## 7. Editor — đặc tả chi tiết (✅ ĐÃ CHỐT: Tiptap · Markdown · H1–H4)

### 7.1 Hành vi mong muốn ("như MD editor")
- Gõ `# ` → **H1**, `## ` → **H2**, `### ` → **H3**, `#### ` → **H4** (✅ Q9: heading chỉ đến cấp 4; H5–H6 để Backlog).
- Gõ `- ` / `* ` → bullet · `1. ` → số · `[] ` → checklist · `> ` → trích dẫn · ` ``` ` → code block · `---` → đường kẻ.
- `**đậm**`, `*nghiêng*`, `~~gạch~~`, `` `code` `` → tự định dạng khi gõ.
- Phím tắt mặc định của Tiptap (Ctrl/Cmd + B, I, Z…). Thêm **Ctrl/Cmd + S** = lưu ngay.
- **Menu `/`**: Heading 1–4, Đoạn văn, Danh sách (•, 1., ☐), Trích dẫn, Code block, Đường kẻ.
- **Toolbar** (sticky): Undo/Redo · Dropdown (Đoạn văn / H1–H4) · B I S Code · Link · Danh sách · Trích dẫn · Code block · Đường kẻ.
- Chân editor: số từ, số ký tự, trạng thái lưu.

### 7.2 Khung cấu hình tham khảo (agent PHẢI đối chiếu docs Tiptap hiện hành)

```ts
const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Placeholder.configure({ placeholder: "Gõ '/' để chèn khối, hoặc cứ viết…" }),
    TaskList,
    TaskItem.configure({ nested: true }),
    // + Link, CodeBlockLowlight (highlight), Markdown (đọc/ghi .md)
  ],
  content: tab.value,
  onUpdate: ({ editor }) => scheduleSave(/* nội dung hiện tại → Markdown */),
});
```

### 7.3 Định dạng lưu `value` — ✅ Q4: Markdown
- **Đã chốt: Markdown string** — dễ đọc, dễ debug trong Console, xuất `.md` trực tiếp, không phụ thuộc editor.
- Rủi ro: một số cấu trúc phức tạp có thể không round-trip hoàn hảo (md → editor → md). Agent phải **test round-trip** cho mọi loại khối ở Mục 7.1; nếu lệch → báo chủ dự án, đề xuất chuyển sang lưu JSON của editor.

### 7.4 Giao diện nội dung (typography) — "đẹp như MD editor"

| Phần tử | Gợi ý style |
|---|---|
| Khung đọc | `max-width: ~760px`, căn giữa, padding rộng rãi |
| Font | Body: Inter / system-ui · Code: JetBrains Mono |
| **H1** | ~2rem, đậm 700, margin-top lớn, có đường kẻ mảnh phía dưới |
| **H2** | ~1.5rem, 650 |
| **H3** | ~1.25rem, 600 |
| **H4** | ~1.0625rem, 600, màu hơi nhạt (muted) để phân cấp |
| Đoạn văn | 1rem / line-height ~1.75 |
| Trích dẫn | viền trái 3px màu accent, nền nhạt |
| Code inline | nền xám nhạt, bo 4px, font mono |
| Code block | nền theo theme, highlight cú pháp, nút **Copy** |
| Danh sách | marker màu accent; checklist có checkbox tuỳ biến, tick thì mờ + gạch ngang |
| Link | màu accent, underline offset |
| Hỗ trợ | Light + Dark, tương phản đạt WCAG AA |

### 7.5 Autosave
- Debounce **~1000 ms** sau thay đổi cuối; lưu thêm khi **đổi tab / blur / trước khi rời trang** (best-effort).
- Trạng thái hiển thị: `Đang lưu…` → `Đã lưu lúc HH:mm` → `Lỗi lưu — Thử lại`.
- **Không** gọi `setContent` mỗi khi `onSnapshot` trả về nếu thay đổi đó do chính mình vừa ghi (dùng `snapshot.metadata.hasPendingWrites`) — tránh nhảy con trỏ / mất chữ đang gõ.
- Xung đột nhiều thiết bị: MVP dùng **last-write-wins**; ghi vào Backlog nếu cần merge.
- Nội dung chưa lưu được (offline/lỗi) phải **giữ lại trong bộ nhớ** và retry, không được âm thầm bỏ.

---

## 8. UI / UX

### 8.1 Bố cục
```
┌──────────────┬──────────────────────────────────────────┐
│ Sidebar      │ [Tiêu đề ghi chú ........................]│
│ ─ Tìm kiếm   │ [Tab 1] [Tab 2] [Tab 3] [＋]                │
│ ─ ＋ Ghi chú │ ┌──────────────────────────────────────┐ │
│ ─ Note A     │ │ Toolbar: ↶ ↷ | H▾ | B I S </> | 🔗 …  │ │
│ ─ Note B ●   │ ├──────────────────────────────────────┤ │
│ ─ Note C     │ │  # Heading 1                         │ │
│ ─────────    │ │  Nội dung…                           │ │
│ 👤 user ▾    │ └──────────────────────────────────────┘ │
│              │ 245 từ · Đã lưu lúc 14:32                 │
└──────────────┴──────────────────────────────────────────┘
```
- **Mobile:** sidebar thành drawer; toolbar dính đáy màn hình.
- **Phase 2:** panel Outline bên phải (mục lục từ H1–H4).

### 8.2 Routes
| Path | Mô tả | Bảo vệ |
|---|---|---|
| `/login`, `/register`, `/reset-password` | Xác thực | Công khai (đã đăng nhập thì chuyển về `/`) |
| `/` | Ứng dụng (chưa chọn note) | Cần đăng nhập |
| `/n/:noteId` | Mở ghi chú, tab đang mở lưu ở `?tab=<tabId>` | Cần đăng nhập |

### 8.3 Bắt buộc cho mọi màn hình có dữ liệu
- Trạng thái **loading** (skeleton), **empty** (hướng dẫn tạo note đầu tiên), **error** (thông báo + nút thử lại).
- Hành động phá huỷ (xoá note/tab) → **hộp thoại xác nhận**.
- Điều hướng bàn phím + `aria-label` cho nút icon; focus ring rõ ràng.
- Thông báo lỗi Firebase Auth dịch sang tiếng Việt, ví dụ: `auth/invalid-credential` → "Email hoặc mật khẩu không đúng", `auth/email-already-in-use` → "Email đã được đăng ký", `auth/weak-password` → "Mật khẩu quá yếu", `auth/popup-closed-by-user` → "Bạn đã đóng cửa sổ đăng nhập", `auth/network-request-failed` → "Lỗi mạng, thử lại sau". **Không** để lộ mã lỗi thô cho người dùng.

### 8.4 Auth flow
- Email + Password, Google (✅ Q7). Xác minh email: **tắt** ở MVP (⚠️ còn mở — hỏi nếu cần bật).
- Giữ phiên đăng nhập (persistence mặc định của trình duyệt).
- Khi đăng xuất: huỷ mọi `onSnapshot`, xoá state trong bộ nhớ; cân nhắc xoá cache IndexedDB nếu dùng máy chung.
- `AuthProvider` + `ProtectedRoute`; chờ trạng thái `onAuthStateChanged` xong mới render (tránh nháy trang login).

---

## 9. Cấu trúc thư mục

```
ghichu-notebook/
├─ AGENTS.md                  # file này
├─ .env.example               # khung biến môi trường (giá trị rỗng)
├─ .env.local                 # KHÔNG commit
├─ firebase.json
├─ firestore.rules
├─ firestore.indexes.json
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ lib/
│  │  └─ firebase.ts          # init Firebase (duy nhất 1 nơi)
│  ├─ types/
│  │  └─ note.ts              # Note, NoteTab
│  ├─ services/               # TOÀN BỘ chỗ gọi Firebase nằm ở đây
│  │  ├─ authService.ts
│  │  └─ noteService.ts
│  ├─ features/
│  │  ├─ auth/                # LoginPage, RegisterPage, AuthProvider, ProtectedRoute
│  │  └─ notes/
│  │     ├─ components/       # Sidebar, NoteList, TabBar, NoteTitle, SaveStatus
│  │     ├─ editor/           # Editor.tsx, Toolbar.tsx, SlashMenu.tsx, extensions/
│  │     └─ hooks/            # useNotes, useAutosave, useActiveNote
│  ├─ components/ui/          # shadcn/ui
│  ├─ styles/                 # globals.css, typography (prose) tuỳ biến
│  └─ utils/                  # debounce, markdown, firebaseErrors (mã lỗi → tiếng Việt)
└─ tests/
   ├─ unit/
   └─ rules/                  # test Security Rules bằng Emulator
```

**Quy tắc:** component UI **không** import trực tiếp `firebase/firestore`. Mọi truy cập dữ liệu đi qua `services/` → dễ test, dễ đổi thiết kế dữ liệu.

---

## 10. QUY TẮC CHO AI AGENT ⭐ (quan trọng nhất)

### 10.1 Nguyên tắc vàng: **HỎI TRƯỚC – LÀM SAU**
- Chủ dự án muốn được **hỏi để xác nhận** thay vì để agent tự quyết các điều quan trọng.
- Không chắc → **hỏi**. Hiểu mơ hồ → **hỏi**. Sắp làm điều khó hoàn tác → **hỏi**.
- Hỏi xong **chờ trả lời**. Không "làm thử luôn cho nhanh" rồi báo sau.
- Luôn **đề xuất sẵn một phương án mặc định** kèm lý do, để chủ dự án chỉ cần trả lời "ok" nếu đồng ý.

### 10.2 Các trường hợp BẮT BUỘC DỪNG LẠI VÀ HỎI

| # | Tình huống |
|---|---|
| 1 | Cài/đổi/nâng **dependency lớn** (framework, editor, UI lib), hoặc nâng **major version** |
| 2 | Đổi **schema Firestore** (thêm/xoá/đổi tên field, đổi cấu trúc collection) |
| 3 | Sửa **Security Rules**, **indexes**, hoặc chạy bất kỳ lệnh **deploy** nào (`firebase deploy …`) |
| 4 | Bật **dịch vụ Firebase mới** (Storage, Functions, …) — có thể phát sinh chi phí / yêu cầu gói Blaze |
| 5 | Thao tác với **dữ liệu thật (production)**; mặc định luôn dùng **Emulator** |
| 6 | **Xoá / đổi tên / di chuyển** nhiều file, hoặc refactor lớn (> ~5 file) |
| 7 | Thay đổi **UX flow / bố cục** đã chốt |
| 8 | Thêm **dịch vụ bên thứ ba** (Sentry, Algolia, analytics…) |
| 9 | Yêu cầu mới **mâu thuẫn** với file này hoặc với quyết định đã chốt |
| 10 | Tính năng **ngoài phạm vi MVP** (Mục 1–2) |
| 11 | Thấy lỗ hổng bảo mật hoặc nguy cơ **mất dữ liệu người dùng** (phải **báo ngay**, không tự vá âm thầm) |

**Không cần hỏi** (cứ làm, rồi báo cáo): sửa bug nhỏ, đổi tên biến cục bộ, format, bổ sung test, bổ sung comment/tài liệu, tinh chỉnh style nhỏ **trong khuôn khổ** đã chốt.

### 10.3 Mẫu câu hỏi chuẩn

```
❓ CẦN XÁC NHẬN: <tiêu đề ngắn>

Ngữ cảnh: <1–2 câu: vì sao phải quyết định chuyện này>

Lựa chọn:
  A) <mô tả> — Ưu: … / Nhược: …
  B) <mô tả> — Ưu: … / Nhược: …

👉 Đề xuất của tôi: A, vì …
⏸️ Trong lúc chờ: tôi sẽ làm <phần độc lập, an toàn> / dừng phần này.
```

- Gộp tối đa **3–5 câu hỏi mỗi lượt**, mỗi câu đều có mặc định đề xuất.
- Câu hỏi phải **cụ thể, trả lời được bằng 1 chữ/1 chữ cái** (A/B, ok, không).

### 10.4 Quy trình làm việc cho MỖI task

1. **Đọc**: file này + code liên quan. Không viết code khi chưa hiểu hiện trạng.
2. **Tóm tắt hiểu biết + kế hoạch** (≤ 10 dòng): sẽ sửa file nào, vì sao, rủi ro gì.
3. **Hỏi xác nhận** nếu thuộc nhóm ở Mục 10.2. Nếu không → tiếp tục.
4. **Làm từng bước nhỏ**: 1 commit = 1 mục đích. Tránh diff khổng lồ.
5. **Tự kiểm tra** (bắt buộc, theo thứ tự): `typecheck` → `lint` → `test` → `build`. Sửa đến khi xanh.
6. **Tự review diff**: có dòng debug/`console.log`/secret/TODO bỏ quên không?
7. **Báo cáo** theo mẫu Mục 10.9, rồi **hỏi OK** trước khi sang task kế tiếp.

### 10.5 TUYỆT ĐỐI KHÔNG

- ❌ Hardcode secret, commit `.env*`, commit service-account key.
- ❌ Rules kiểu `allow read, write: if true;` hoặc để Firestore ở **test mode** (kể cả "tạm").
- ❌ Dùng **Firebase Admin SDK** trong code client.
- ❌ Gọi Firestore/Auth trực tiếp trong component UI (phải qua `services/`).
- ❌ `any` bừa bãi; `// @ts-ignore` / `eslint-disable` mà không kèm lý do.
- ❌ `dangerouslySetInnerHTML` với nội dung người dùng khi chưa sanitize.
- ❌ **Bịa API / tên package / phiên bản.** Phải tra docs chính thức; không chắc thì nói "không chắc".
- ❌ Xoá hoặc làm yếu test chỉ để cho pass.
- ❌ Làm thêm tính năng ngoài yêu cầu (**scope creep**).
- ❌ Lưu ghi chú chính trong `localStorage` (chỉ dùng cho tuỳ chọn UI như theme).
- ❌ `git push --force`, đổi lịch sử git, hoặc đẩy thẳng lên `main` khi chưa được phép.
- ❌ Chạy lệnh phá huỷ (`rm -rf`, xoá collection…) mà chưa hỏi.

### 10.6 Quy ước code

- **TypeScript strict**; ưu tiên `type`/`interface` rõ ràng, tránh `any`.
- **Đặt tên:** Component `PascalCase` · hook `useXxx` · service `xxxService.ts` · field Firestore `camelCase`.
- **Component nhỏ, một trách nhiệm**; logic tách vào hook/service.
- **Mọi thao tác bất đồng bộ** phải xử lý lỗi + hiển thị trạng thái loading/error cho người dùng.
- **`onSnapshot` luôn trả về unsubscribe** và phải được gọi khi unmount/đăng xuất (tránh rò rỉ + tốn read).
- **Tiết kiệm Firestore read/write:** không query thừa, không ghi mỗi phím gõ (đã có debounce).
- **Chuỗi giao diện** tập trung (một chỗ) để dễ chuyển ngôn ngữ sau này (✅ Q8: tiếng Việt, chưa i18n).
- Comment giải thích **"vì sao"**, không lặp lại "cái gì" mà code đã nói.
- **Commit:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`), nhánh `feat/<tên>`, `fix/<tên>`.

### 10.7 Kiểm thử bắt buộc

| Loại | Công cụ | Phạm vi |
|---|---|---|
| Unit | Vitest | `utils/`, chuyển đổi markdown, debounce, map lỗi Firebase |
| Component | React Testing Library | Form đăng nhập, TabBar, SaveStatus |
| **Security Rules** | Emulator + `@firebase/rules-unit-testing` | A ≠ B; chưa đăng nhập bị chặn; không đổi `userId`; vượt giới hạn tab/title bị từ chối |
| E2E (Phase sau) | Playwright | đăng nhập → tạo note → gõ → reload còn nguyên |

Phải **chạy thử trên Emulator**, không chạy thử trên dữ liệu thật.

### 10.8 Lệnh thường dùng (điều chỉnh theo package.json thật)

```bash
npm install
npm run dev                   # chạy local
npm run typecheck && npm run lint && npm run test && npm run build
firebase emulators:start      # Auth + Firestore emulator
firebase deploy --only firestore:rules,firestore:indexes   # ⚠️ PHẢI HỎI trước
firebase deploy --only hosting                             # ⚠️ PHẢI HỎI trước
```

### 10.9 Mẫu báo cáo sau mỗi task

```
✅ Đã làm: <1–3 gạch đầu dòng>
📁 File thay đổi: <danh sách>
🧪 Kiểm thử: typecheck ✓ / lint ✓ / test ✓ / build ✓ (hoặc nêu rõ cái nào chưa)
⚠️ Rủi ro / điều chưa chắc: <nếu có>
❓ Cần xác nhận tiếp: <câu hỏi + đề xuất mặc định>
➡️ Task tiếp theo đề xuất: <tên task>
```

---

## 11. Lộ trình & cổng xác nhận

> Mỗi phase kết thúc bằng một **🚪 Cổng xác nhận**: agent dừng lại, báo cáo (Mục 10.9) và chờ chủ dự án duyệt mới sang phase tiếp.

### Phase 0 — Chốt quyết định ✅ XONG 2026-11-14
- [x] Chủ dự án trả lời **Mục 14**; agent cập nhật **Mục 15**
- [ ] 🚪 Duyệt tech stack + schema

### Phase 1 — Nền tảng ✅ XONG 2026-11-14
- [x] Khởi tạo Vite + React + TS, Tailwind, shadcn/ui, ESLint, Prettier
- [x] `.env.example`, `.gitignore`, `lib/firebase.ts`
- [x] Cấu hình Firebase Emulator + `firebase.json`
- [ ] 🚪 App chạy được, hiện trang trống, lint/test/build xanh

### Phase 2 — Xác thực ✅ XONG 2026-11-14
- [x] `authService`, `AuthProvider`, `ProtectedRoute`
- [x] Trang Login / Register / Reset password; Google sign-in
- [x] Dịch lỗi Auth sang tiếng Việt
- [ ] 🚪 Đăng ký → đăng nhập → đăng xuất → reload vẫn giữ phiên

### Phase 3 — Ghi chú (CRUD) + Sidebar
- [ ] `noteService`, `useNotes` (realtime), Sidebar, tìm theo tiêu đề
- [ ] Tạo / đổi tên / xoá note (có xác nhận)
- [ ] **Viết `firestore.rules` + test rules** (làm ngay phase này, không để cuối)
- 🚪 Note của user A không thể thấy/sửa bởi user B (test xanh)

### Phase 4 — Editor
- [ ] Tiptap: heading H1–H4, định dạng cơ bản, danh sách, checklist, quote, code block, hr, link
- [ ] Markdown shortcuts, Toolbar, menu `/`
- [ ] Typography đẹp (Mục 7.4), Light/Dark
- [ ] Autosave + SaveStatus (Mục 7.5)
- 🚪 Gõ `#`…`####` ra đúng heading; reload nội dung còn nguyên; round-trip Markdown ổn

### Phase 5 — Tabs
- [ ] Thêm / đổi tên / xoá / kéo-thả sắp xếp tab; nhớ tab đang mở qua `?tab=`
- [ ] Cảnh báo khi dung lượng note ≈ 700 KB
- 🚪 Nhiều tab hoạt động ổn, không mất dữ liệu khi chuyển tab

### Phase 6 — Hoàn thiện
- [ ] Responsive (drawer mobile), a11y, loading/empty/error states
- [ ] Offline cache, xuất `.md`
- 🚪 Duyệt giao diện trên desktop + điện thoại

### Phase 7 — Triển khai
- [ ] (Khuyến nghị) App Check + giới hạn API key theo referrer + budget alert
- [ ] Deploy rules/indexes → Hosting (**hỏi trước từng lệnh deploy**)
- [ ] Checklist bảo mật (Mục 13)
- 🚪 Đưa lên production

### Backlog
Chế độ Markdown thô/Preview · Outline H1–H4 · Ghim · Thùng rác · Tag · Bảng · Tìm trong nội dung · Lịch sử phiên bản · PWA · Upload ảnh · Chia sẻ note · Merge xung đột đa thiết bị.

---

## 12. Definition of Done (một task coi là xong khi…)

- [ ] Đúng yêu cầu + đúng file này; không có tính năng thừa
- [ ] `typecheck`, `lint`, `test`, `build` đều xanh
- [ ] Có test cho logic mới (và test rules nếu đụng dữ liệu)
- [ ] Có đủ trạng thái loading / empty / error
- [ ] Không có secret, `console.log` thừa, TODO bỏ quên
- [ ] Đã báo cáo theo mẫu Mục 10.9 và chủ dự án đã duyệt

---

## 13. Checklist bảo mật

- [ ] Security Rules đã triển khai và **có test**; không ở test mode
- [ ] `userId` bất biến; chỉ chủ sở hữu đọc/ghi/xoá
- [ ] `.env*` không nằm trong git; có `.env.example`
- [ ] API key giới hạn theo HTTP referrer; **App Check** bật (khuyến nghị)
- [ ] Authorized domains của Auth chỉ gồm domain thật
- [ ] Không render HTML từ người dùng khi chưa sanitize; link ngoài dùng `rel="noopener noreferrer"`
- [ ] Không log dữ liệu cá nhân/nội dung ghi chú ra console production
- [ ] Budget alert đã đặt trong Google Cloud

---

## 14. Quyết định đã chốt — ✅ 16/16 (2026-11-14)

> **Phase 0 xong.** Muốn đổi bất kỳ mục nào dưới đây = thay đổi quyết định đã chốt → agent phải **hỏi lại** (Mục 10.2 #9) và ghi vào Mục 15.

| # | Nội dung | Quyết định |
|---|---|---|
| Q1 | Tên app | **GhiChu Notebook** |
| Q2 | Framework | **React + Vite** (SPA) |
| Q3 | Editor | **Tiptap** |
| Q4 | Định dạng lưu `value` | **Markdown string** |
| Q5 | `value` thuộc đâu | **Từng tab** |
| Q6 | Cách lưu tab | **Nhúng `tabs[]`** trong `notes/{noteId}` |
| Q7 | Đăng nhập | **Email/Password + Google** |
| Q8 | Ngôn ngữ giao diện | **Tiếng Việt** (chưa i18n) |
| Q9 | Cấp heading | **H1–H4** |
| Q10 | Thư viện giao diện | **Tailwind CSS + shadcn/ui + lucide-react** |
| Q11 | Hosting | **Firebase Hosting** |
| Q12 | Offline cache (IndexedDB) | **Có** |
| Q13 | Package manager | **npm** |
| Q14 | Firebase Analytics | **Không** (MVP) |
| Q15 | Quy mô người dùng | **Cá nhân / ít người** |
| Q16 | Chia sẻ note / cộng tác | **Không** (MVP) |

**Còn mở (ngoài 16 câu):** xác minh email khi đăng ký — mặc định **tắt**; bật hay không sẽ hỏi ở Phase 2.

---

## 15. Decision Log

| Ngày | Quyết định | Lựa chọn | Lý do / ghi chú |
|---|---|---|---|
| 2026-11-14 | Q1–Q2, Q4–Q5, Q8–Q12, Q14–Q16 (dùng mặc định) | GhiChu Notebook · React+Vite+TS · Markdown · value theo tab · tiếng Việt · H1–H4 · Tailwind+shadcn/ui · Firebase Hosting · offline cache bật · không Analytics · cá nhân · không chia sẻ | Chủ dự án xác nhận chốt Phase 0, không phản đối các mặc định này |
| 2026-11-14 | Q3 — Editor | **Tiptap** | WYSIWYG, gõ `#` ra heading như MD editor, hệ sinh thái lớn, dễ làm Toolbar + menu `/` |
| 2026-11-14 | Q6 — Lưu tab | **Nhúng `tabs[]`** trong `notes/{noteId}` | Đơn giản, khớp schema ban đầu; giới hạn 1 MiB đủ cho note text; đổi sang subcollection sau nếu cần vì mọi truy cập qua `noteService` |
| 2026-11-14 | Q7 — Đăng nhập | **Email/Password + Google** | Đủ dùng cho cá nhân, Google giúp đăng nhập 1 chạm trên mobile |
| 2026-11-14 | Q13 — Package manager | **npm** | Máy đã có npm 12, pnpm chưa cài → không cần thêm bước cài đặt |
| 2026-11-14 | Xác minh email khi đăng ký | **Tắt** ở MVP (mặc định, chưa chốt cứng) | Giảm ma sát đăng ký; sẽ hỏi lại ở Phase 2 |
| 2026-11-14 | Phiên bản TypeScript | **6.0.3** (không dùng 7.x) | `typescript-eslint` 8.x khai báo peer `typescript <6.1.0`; TS 7 sẽ không lint được. Ghi đè version mặc định của template Vite 8 |

---

## 16. Trạng thái hiện tại & bước tiếp theo

> **Phase 0 đã chốt (2026-11-14).** 16/16 câu ở Mục 14 đã có câu trả lời; tech stack + schema được duyệt.
> **Phase 1 đã dựng xong (2026-11-14).** Vite 8 + React 19 + TS 6, Tailwind v4 + shadcn/ui (preset Nova), ESLint 10 + Prettier, Vitest + RTL, `src/lib/firebase.ts`, `firebase.json` + rules + indexes, Firebase CLI 15. Emulator chạy được; `typecheck`/`lint`/`test`/`build` đều xanh.
> **Phase 2 đã dựng xong (2026-11-14).** `authService`, `AuthProvider` + `useAuth`, `ProtectedRoute` / `PublicOnlyRoute`, 3 trang xác thực, map lỗi Auth → tiếng Việt, kết nối Emulator qua `VITE_USE_FIREBASE_EMULATOR`. Đã test tay trên Emulator: đăng ký → vào app → reload giữ phiên → đăng xuất → sai mật khẩu báo đúng tiếng Việt → đăng nhập lại → gửi email đặt lại mật khẩu. **Google popup chưa test được trên Emulator.**

Bước tiếp theo là **Phase 3 — Ghi chú (CRUD) + Sidebar**: `noteService`, `useNotes` realtime, Sidebar, tìm theo tiêu đề, tạo/đổi tên/xoá note, và **viết test Security Rules bằng Emulator** (làm ngay trong phase này).

Khi bắt đầu một phiên mới, agent đọc lại file này và **không hỏi lại các mục đã chốt**; chỉ hỏi khi có mâu thuẫn hoặc khi sang quyết định mới thuộc Mục 10.2.
