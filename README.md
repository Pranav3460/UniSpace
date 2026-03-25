# 🎓 CampusConnectCur

> **A real-time, full-stack campus super-app for students, teachers, and administrators.**  
> Built with React Native · Expo · TypeScript · Node.js · Express · Socket.io · MongoDB

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Expo](https://img.shields.io/badge/expo-54.0.30-black)
![React Native](https://img.shields.io/badge/react--native-0.81.5-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue)
![Node.js](https://img.shields.io/badge/node.js-18+-green)
![Express](https://img.shields.io/badge/express-4.18.2-lightgrey)
![Socket.io](https://img.shields.io/badge/socket.io-4.8.1-black)
![MongoDB](https://img.shields.io/badge/mongodb-mongoose%208.19.1-green)
![License](https://img.shields.io/badge/license-ISC-yellow)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Documentation](#6-api-documentation)
7. [Socket.io Events Reference](#7-socketio-events-reference)
8. [Environment Variables](#8-environment-variables)
9. [Installation & Setup](#9-installation--setup)
10. [User Roles & Workflows](#10-user-roles--workflows)
11. [Real-Time Architecture](#11-real-time-architecture)
12. [News Feed Architecture](#12-news-feed-architecture)
13. [Global Admin Accounts](#13-global-admin-accounts)
14. [Known Issues & Troubleshooting](#14-known-issues--troubleshooting)
15. [Project Stats](#15-project-stats)
16. [Contributing](#16-contributing)

---

## 1. Project Overview
 
**UniSpace** is a campus management and communication platform designed for universities and colleges. It centralises academic life into one mobile application accessible to Students, Teachers, and Global Admins — all connected in real-time via Socket.io.

### Who is it for?
- **Students** — Discover events, join study groups, find lost items, access resources, track approval status.
- **Teachers** — Manage approvals, create events, moderate study groups, post notices.
- **Global Admins** — Full system control: manage users, approve teachers, publish events, broadcast to all.

### Key Highlights
- 🔴 **Fully Real-Time** — Socket.io powers live updates across all modules with no page refresh.
- 📰 **Infinite Tech News Archive** — Aggregates Hacker News + Dev.to with persistent MongoDB archive and automatic background polling.
- 🏆 **Event Hub** — Full event lifecycle management with student→teacher→admin approval workflows.
- 💬 **Study Groups** — Real-time group chat with file/image sharing, member management, and join approval.
- 📢 **Notice Board** — Department and year-filtered announcements with real-time broadcasting.
- 🔍 **Lost & Found** — Report and claim lost items with real-time status updates.
- 📁 **Resource Library** — Searchable academic PDFs by subject, year, and department.
- 🔔 **Notification Bell** — Persistent in-app notification centre with toast alerts.
- 🌙 **Dark Mode** — Full system-wide dark/light theme support.

---

## 2. Features

### 2.1 Authentication & Authorization

- **Sign Up** — Email, password, name, phone, designation, school, profile photo.
  - Students → `approved` status immediately.
  - Teachers → `pending` status until approved by Global Admin.
  - Registration as `admin` is blocked via the API.
- **Login** — Email + password. Teachers with `pending` or `rejected` status are denied login.
- **Role-Based Access** — Three roles: `student`, `teacher`, `admin`.
- **Session Persistence** — User profile cached in `AuthContext` and fetched fresh on app load via `/api/user/profile`.
- **Password Change** — Verified with current password before updating hash.
- **No JWT tokens** — Authentication is session-based using email stored in client context with bcrypt password verification.

### 2.2 User Roles & Permissions

| Feature                        | Student | Teacher | Global Admin |
|-------------------------------|:-------:|:-------:|:------------:|
| View Notices                   | ✅      | ✅      | ✅           |
| Post Notices                   | ❌      | ✅      | ✅           |
| Delete Notices                 | ❌      | ❌      | ✅           |
| View Approved Events           | ✅      | ✅      | ✅           |
| Request Event Creation         | ✅      | ❌      | ❌           |
| Create Events Directly         | ❌      | ✅      | ✅           |
| Approve/Reject Events          | ❌      | ✅      | ✅           |
| Postpone Events                | ❌      | ✅      | ✅           |
| Delete Events                  | ❌      | ❌      | ✅           |
| View Tech News                 | ✅      | ✅      | ✅           |
| Create Study Groups            | ✅      | ✅      | ✅           |
| Approve Study Group Requests   | ❌      | ✅      | ✅           |
| Chat in Study Groups           | ✅      | ✅      | ✅           |
| Promote/Demote Group Members   | ✅*     | ✅*     | ✅           |
| Report Lost & Found            | ✅      | ✅      | ✅           |
| Claim Lost Items               | ✅      | ✅      | ✅           |
| Upload Resources               | ✅      | ✅      | ✅           |
| Approve/Reject Teachers        | ❌      | ❌      | ✅           |
| View Admin Dashboard           | ❌      | ❌      | ✅           |
| Edit Own Profile               | ✅      | ✅      | ✅           |

> \* Group admins/creators only

### 2.3 Event Hub

The Event Hub is the central module for all campus events and hackathons.

**Features:**
- Filter by type: `Hackathon`, `Workshop`, `Seminar`, `Competition`.
- Student submission workflow with approval tracking.
- Postpone events with new date/time and reason.
- Real-time updates when events change status.

**Student Request → Approval Flow:**
```
Student submits request
       ↓
Event created with status 'pending'
       ↓
Socket → approval_queue room (Teachers + Admins notified)
Socket → NOTIFICATION_NEW sent to teachers + admins
       ↓
Teacher/Admin reviews in Approvals tab
       ↓
   ┌───┴────┐
APPROVE    REJECT (requires reason ≥5 chars)
   ↓         ↓
Event        Event status → 'rejected'
status →     Socket → APPROVAL_REJECTED → creator
'approved'   Socket → NOTIFICATION_NEW → creator
Socket →
EVENT_CREATED → eventhub room
APPROVAL_APPROVED → creator's private room
```

### 2.4 Tech News Feed (Event Hub — News Tab)

- **Sources:** Hacker News (Algolia API) + Dev.to API (no API keys required).
- **Live Feed** — 60-second background polling loop with Socket.io push updates.
- **Archive** — Permanent MongoDB persistence with 5-minute batch sync and hourly category cleanup.
- **Categories:** `live` (last 24h) → `recent` (1–7 days) → `weekly` (7–30 days) → `deep_archive` (30+ days).
- **Breaking News** — Keyword detection broadcasts urgent alerts to all connected clients.
- **Client Features:** Bookmarks, read history, offline cache (AsyncStorage), search, source filters, infinite scroll.
- **Offline Support** — Falls back to AsyncStorage cache when network is unavailable (via NetInfo).

### 2.5 Study Groups

- Create groups for any subject — students get pending status, teachers/admins get auto-approved.
- **Real-Time Chat** — Text, image (Cloudinary), and file (Cloudinary) messages.
- **Permission Hierarchy:** Group Creator → Group Admins → Members.
- Join request system — request → group admin approves/rejects.
- Promote/demote members to/from group admin.
- Delete messages (group admins only), remove members, leave group.

### 2.6 Notice Board

- Filter by `department`, `year`, and `type` (`Exam`, `Event`, `General`).
- Full-text search using MongoDB `$text` index.
- File attachments (PDF etc.) uploaded via Cloudinary.
- Real-time: new notices broadcast via `notice:create` event.

### 2.7 Lost & Found

- Report items with title, description, location, contact, and photo.
- Claim items — status changes to `Claimed` with real-time update.
- Delete own reports, with email ownership verification.

### 2.8 Resource Library

- Upload academic resources (PDFs) with subject, year, department, school filters.
- Full-text search. Resources scoped to school.
- PDF upload via Cloudinary.

### 2.9 Profile & Settings

- Edit name, phone, designation, school, profile photo.
- Change password with current-password verification.
- Toggle dark/light mode (persisted via ThemeContext).
- Display role badge and account status.

### 2.10 Notification Bell (`RealtimeNotificationBell`)

- Listens for `NOTIFICATION_NEW` socket events.
- Displays unread count badge on bell icon.
- Dropdown modal with notification history (type, message, timestamp).
- Global toast notifications via `ToastContext` on each incoming alert.

### 2.11 Admin Dashboard

- View and manage all registered teachers.
- Approve or reject teacher accounts.
- Remove teacher accounts (with confirmation).
- Real-time teacher list with status badges (`PENDING`, `APPROVED`, `REJECTED`).

---

## 3. Tech Stack

### 3.1 Frontend / Mobile

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Mobile framework |
| Expo | ~54.0.30 | Development platform & toolchain |
| TypeScript | ~5.9.2 | Type safety |
| React | 19.1.0 | UI library |
| React Navigation (Drawer) | ^7.5.9 | Drawer navigation |
| React Navigation (Native Stack) | ^7.3.28 | Stack navigation |
| Socket.io Client | ^4.8.1 | Real-time connections |
| @expo/vector-icons | ^15.0.2 | Icon library (Ionicons) |
| expo-image-picker | ~17.0.10 | Image selection from gallery |
| expo-document-picker | ~14.0.8 | Document/file picker |
| @react-native-community/datetimepicker | 8.4.4 | Date & time pickers |
| @react-native-async-storage/async-storage | 2.2.0 | Persistent local storage |
| @react-native-community/netinfo | 11.4.1 | Network connectivity detection |
| @react-native-picker/picker | 2.11.1 | Dropdown pickers |
| react-native-gesture-handler | ~2.28.0 | Gesture support for navigation |
| react-native-reanimated | ^4.1.3 | Animations |
| react-native-safe-area-context | ^5.6.1 | Safe area insets |
| firebase | ^12.6.0 | Firebase SDK (configured) |
| axios | ^1.12.2 | HTTP client |

### 3.2 Backend / Server

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | ^4.18.2 | HTTP framework |
| Socket.io | ^4.8.1 | Real-time WebSocket server |
| TypeScript | ^5.9.3 | Type safety |
| mongoose | ^8.19.1 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| cloudinary | ^2.8.0 | File/image cloud storage |
| multer | ^2.0.2 | Multipart file handling |
| morgan | ^1.10.1 | HTTP request logging |
| cors | ^2.8.5 | Cross-origin resource sharing |
| dotenv | ^17.2.3 | Environment variable loading |
| nodemon | ^3.1.10 | Dev server auto-restart |
| ts-node | ^10.9.2 | TypeScript execution |

### 3.3 Database

| Technology | Version | Purpose |
|---|---|---|
| MongoDB (Atlas) | — | Primary document database |
| Mongoose | ^8.19.1 | Schema + ODM |

### 3.4 External APIs & Services

| Service | Purpose | Auth Required |
|---|---|---|
| Hacker News (Algolia) | Tech news source (front page stories) | No |
| Dev.to API | Programming articles by topic tags | No |
| Cloudinary | Image and file uploads (CDN storage) | API Key |
| MongoDB Atlas | Hosted database | Connection URI |

---

## 4. Project Structure

```
CampusConnectCur/
├── App.tsx                         # Root navigation: AuthStack + MainDrawer
├── index.ts                        # Expo entry point
├── app.json                        # Expo config (name, icons, android package)
├── package.json                    # Frontend dependencies & scripts
├── tsconfig.json                   # TypeScript config (strict mode)
├── babel.config.js                 # Babel transpiler config
├── metro.config.js                 # Metro bundler config
├── assets/                         # Icons, splash, adaptive icons
│
├── src/
│   ├── api/
│   │   └── client.ts               # API_BASE_URL constant
│   │
│   ├── context/
│   │   ├── AuthContext.tsx          # Auth state: email, role, userProfile
│   │   ├── SocketContext.tsx        # Socket.io connection provider
│   │   ├── ThemeContext.tsx         # Dark/Light mode + color tokens
│   │   └── ToastContext.tsx         # Global toast notification system
│   │
│   ├── components/
│   │   ├── RealtimeNotificationBell.tsx  # Bell icon + notification dropdown
│   │   ├── TechNewsTab.tsx               # Live feed + archive news UI
│   │   ├── InlineVideo.tsx               # Inline video player
│   │   └── MediaUploadTester.tsx         # Debug media upload component
│   │
│   ├── hooks/
│   │   ├── useLiveNews.ts           # Socket + polling state for live news
│   │   └── useNewsArchive.ts        # Paginated archive queries
│   │
│   ├── utils/
│   │   ├── storage.ts               # AsyncStorage wrapper (RN-safe)
│   │   └── newsLocalStorage.ts      # News bookmarks, cache, read history
│   │
│   ├── types/
│   │   └── firebase-react-native.d.ts  # Firebase type declarations
│   │
│   └── screens/
│       ├── GetStartedScreen.tsx     # Landing / onboarding
│       ├── LoginScreen.tsx          # Email + password login
│       ├── SignupScreen.tsx         # New user registration
│       ├── PendingScreen.tsx        # Shown to teachers awaiting approval
│       ├── RejectedScreen.tsx       # Shown to rejected accounts
│       ├── NoticesScreen.tsx        # Notice board with filters
│       ├── LostFoundScreen.tsx      # Lost & Found with claim flow
│       ├── StudyGroupsScreen.tsx    # Groups list + group chat room
│       ├── ResourcesScreen.tsx      # Resource library browser
│       ├── UploadResourceScreen.tsx # Upload academic PDFs
│       ├── ReportFoundScreen.tsx    # Report a lost item
│       ├── EventsScreen.tsx         # Event Hub (events + news + approvals)
│       ├── ProfileEditScreen.tsx    # Edit profile, change password
│       ├── SettingsScreen.tsx       # Theme toggle, account settings
│       ├── AdminDashboardScreen.tsx # Global admin dashboard
│       └── AdminTeacherListScreen.tsx  # Teacher approval management
│
└── server/
    ├── package.json                 # Server dependencies
    ├── .env                         # Server environment variables
    └── src/
        ├── index.ts                 # Express app, Socket.io, all routes & schemas
        ├── seed_data.ts             # Seeds admin accounts & initial data
        ├── seed_notices.ts          # Seeds sample notices
        ├── list_users.ts            # Utility: list all registered users
        │
        ├── models/
        │   └── News.ts              # NewsArchive + NewsRefreshLog schemas
        │
        └── services/
            └── newsService.ts       # News fetching, caching, archival, cleanup
```

---

## 5. Database Schema

### 5.1 Users

| Field | Type | Description |
|---|---|---|
| `email` | String (unique) | User email — primary identifier |
| `passwordHash` | String | bcrypt hashed password |
| `name` | String | Full display name |
| `phone` | String | Contact phone number |
| `designation` | String | Job title / student year |
| `school` | String | Institution / school name |
| `photoUrl` | String | Cloudinary profile image URL |
| `role` | Enum: `student`, `teacher`, `admin` | Access role |
| `status` | Enum: `pending`, `approved`, `rejected` | Account approval state |
| `createdAt` | Date | Auto-managed by Mongoose |
| `updatedAt` | Date | Auto-managed by Mongoose |

### 5.2 Events (Hackathons & Events)

| Field | Type | Description |
|---|---|---|
| `title` | String | Event name |
| `type` | Enum: `Hackathon`, `Workshop`, `Seminar`, `Competition`, `Other` | Category |
| `date` | String | Event date |
| `time` | String | Event time |
| `location` | String | Venue or URL |
| `mode` | Enum: `Online`, `Offline`, `Hybrid` | Format |
| `organizer` | String | Organising entity |
| `description` | String | Full description |
| `imageUrl` | String | Cloudinary cover image |
| `timings` | String | Schedule details |
| `registration_deadline` | String | Registration cutoff |
| `max_participants` | Number | Capacity limit |
| `contact_name` | String | Point of contact |
| `contact_email` | String | Contact email |
| `notes` | String | Additional notes |
| `status` | Enum: `pending`, `approved`, `rejected`, `postponed`, `completed` | Lifecycle state |
| `school` | String | Scoped to institution |
| `createdByEmail` | String | Creator's email |
| `createdByRole` | String | Creator's role at time of creation |
| `approvedBy` | String | Reviewer's email |
| `rejectionReason` | String | Reason for rejection |
| `postponeReason` | String | Reason for postponement |
| `newDate` | String | Rescheduled date |
| `newTime` | String | Rescheduled time |

### 5.3 Notices

| Field | Type | Description |
|---|---|---|
| `title` | String | Notice heading |
| `department` | String | Target department |
| `year` | String | Target academic year |
| `type` | Enum: `Exam`, `Event`, `General` | Category |
| `content` | String | Body text |
| `attachmentUrl` | String | Cloudinary file URL |
| `createdAt` | Date | Timestamp |

### 5.4 LostFound

| Field | Type | Description |
|---|---|---|
| `title` | String | Item name |
| `description` | String | Details of the item |
| `location` | String | Where found/lost |
| `contact` | String | Contact info |
| `imageUrl` | String | Cloudinary photo |
| `status` | Enum: `Active`, `Claimed` | Current state |
| `date` | Date | Report date |
| `reportedByEmail` | String | Reporter's email |

### 5.5 Resources

| Field | Type | Description |
|---|---|---|
| `title` | String | Resource name |
| `department` | String | Academic department |
| `subject` | String | Subject name |
| `year` | String | Academic year |
| `tags` | [String] | Search tags |
| `url` | String | Cloudinary PDF URL |
| `popularity` | Number | View/download count |
| `school` | String | Institution scope |

### 5.6 Groups (Study Groups)

| Field | Type | Description |
|---|---|---|
| `name` | String | Group name |
| `subject` | String | Study subject |
| `createdByEmail` | String | Founder email |
| `createdByDesignation` | String | Founder designation |
| `school` | String | Institution |
| `status` | Enum: `Pending`, `Approved` | Approval state |
| `members` | [String] | Member email list |
| `admins` | [String] | Admin email list |
| `joinRequests` | [String] | Pending join request emails |
| `messages` | [Message] | Embedded chat messages |

**Message sub-document:**

| Field | Type | Description |
|---|---|---|
| `sender` | String | Sender email |
| `senderName` | String | Sender display name |
| `senderPhoto` | String | Sender avatar URL |
| `content` | String | Text message |
| `imageUrl` | String | Image attachment URL |
| `fileUrl` | String | File attachment URL |
| `fileName` | String | Original filename |
| `fileType` | String | MIME type |
| `createdAt` | Date | Message timestamp |

### 5.7 ApprovalRequests

| Field | Type | Description |
|---|---|---|
| `eventId` | String | Related event ID |
| `requestedByEmail` | String | Student email |
| `reviewedByEmail` | String | Reviewer email |
| `decision` | Enum: `approved`, `rejected` | Outcome |
| `rejectionReason` | String | Reason (if rejected) |
| `reviewedAt` | Date | Decision timestamp |

### 5.8 NewsArchive

| Field | Type | Description |
|---|---|---|
| `article_id` | String | Composite ID (e.g., `hn_123`, `devto_456`) |
| `source` | String | `Hacker News` or `Dev.to` |
| `source_label` | String | Display label |
| `source_color` | String | Brand colour hex |
| `title` | String | Article headline |
| `description` | String | Summary/excerpt |
| `url` | String (unique) | Canonical article URL — dedup key |
| `image_url` | String | Cover image |
| `author` | String | Author name |
| `author_avatar` | String | Author profile image URL |
| `tags` | [String] | Topic tags |
| `read_time` | String | Estimated read time |
| `score` | Number | Upvotes / reactions |
| `comments_count` | Number | Comment count |
| `published_at` | Date | Article publish date |
| `first_fetched_at` | Date | When first indexed |
| `last_updated_at` | Date | Last score/comment update |
| `archive_category` | Enum: `live`, `recent`, `weekly`, `deep_archive` | Lifecycle bucket |
| `is_breaking` | Boolean | Breaking news flag |
| `breaking_keyword` | String | Matched breaking keyword |
| `fetch_count` | Number | How many times re-fetched |

### 5.9 NewsRefreshLog

| Field | Type | Description |
|---|---|---|
| `refreshed_at` | Date | Timestamp of refresh run |
| `new_count` | Number | New articles found |
| `updated_count` | Number | Articles with updated stats |
| `sources_used` | [String] | Active source names |
| `duration_ms` | Number | Fetch duration in milliseconds |
| `status` | Enum: `success`, `partial`, `failed` | Outcome |

---

## 6. API Documentation

### Auth Endpoints

```
POST /api/signup
Body: { email, password, name, phone, designation, school, photoUrl?, role }
Response: { email, name, role, status }
Note: role='admin' is rejected with 403

POST /api/login
Body: { email, password }
Response: { email, name, phone, designation, school, photoUrl, role, status }
Note: Teachers with status 'pending' or 'rejected' get 403
```

### User Endpoints

```
GET  /api/user/profile?email=
Response: { email, name, phone, designation, school, photoUrl, role, status }

PATCH /api/user/profile
Body: { email, name?, phone?, designation?, school?, photoUrl? }
Response: Updated user object

POST /api/user/change-password
Body: { email, currentPassword, newPassword }
Response: { ok: true }
```

### Upload

```
POST /api/upload
Content-Type: multipart/form-data
Body: file (any type, max 50MB)
Response: { url, publicId }  (Cloudinary URL)
```

### Notices

```
GET  /api/notices?department=&year=&type=&q=
Response: [Notice]

POST /api/notices
Body: { title, department, year, type, content, attachmentUrl? }
Response: Created notice + Socket: notice:create

DELETE /api/notices/:id?requesterEmail=
Response: { ok: true } + Socket: notice:delete
```

### Lost & Found

```
GET  /api/lostfound
Response: [LostFoundItem]

POST /api/lostfound
Body: { title, description, location, contact, imageUrl?, reportedByEmail }
Response: Created item + Socket: lostfound:create

DELETE /api/lostfound/:id?reporter=
Response: { ok: true } + Socket: lostfound:delete

PATCH /api/lostfound/:id/claim
Response: Updated item (status: Claimed) + Socket: lostfound:update
```

### Resources

```
GET  /api/resources?q=&subject=&year=&school=
Response: [Resource]

POST /api/resources
Body: { title, department, subject, year, tags, url, school }
Response: Created resource + Socket: resource:create
```

### Events

```
GET  /api/events?school=&status=
Response: [Event] (default: approved, postponed, completed)

GET  /api/events/pending?school=
Response: [Event] (status: pending only)

GET  /api/events/user/:email
Response: [Event] created by that email

POST /api/events/request         (Student submits)
Body: { title, type, date, time, location, mode, organizer, description, ... }
Response: Created event (status: pending)
Socket: → approval_queue: APPROVAL_REQUEST_RECEIVED
Socket: → teachers: NOTIFICATION_NEW
Socket: → admins: NOTIFICATION_NEW

POST /api/events/create          (Teacher/Admin creates directly)
Body: Same as above
Response: Created event (status: approved)
Socket: → eventhub: EVENT_CREATED
Socket: → global: NOTIFICATION_NEW

PATCH /api/events/:id/approve
Body: { reviewerEmail }
Response: Updated event
Socket: → eventhub: EVENT_CREATED
Socket: → user:{email}: APPROVAL_APPROVED
Socket: → user:{email}: NOTIFICATION_NEW
Socket: → approval_queue: APPROVAL_QUEUE_UPDATED

PATCH /api/events/:id/reject
Body: { reason (min 5 chars), reviewerEmail }
Response: Updated event
Socket: → user:{email}: APPROVAL_REJECTED
Socket: → user:{email}: NOTIFICATION_NEW
Socket: → approval_queue: APPROVAL_QUEUE_UPDATED

PATCH /api/events/:id/postpone
Body: { newDate, newTime, reason }
Response: Updated event
Socket: → eventhub: EVENT_POSTPONED
Socket: → event:{id}: EVENT_POSTPONED

PATCH /api/events/:id
Body: Any event fields
Response: Updated event
Socket: → eventhub: EVENT_UPDATED
Socket: → event:{id}: EVENT_UPDATED

DELETE /api/events/:id
Response: { ok: true }
Socket: → eventhub: EVENT_DELETED
Socket: → event:{id}: EVENT_DELETED
```

### Study Groups

```
GET  /api/groups?status=&school=&createdByEmail=
Response: [Group]

GET  /api/groups/:id
Response: Group with populated members + joinRequests

POST /api/groups
Body: { name, subject, createdByEmail, createdByDesignation, school }
Response: Created group + Socket: group:create

PATCH /api/groups/:id/approve
Body: { action: 'approve'|'reject' }
Response: Updated/deleted group + Socket: group:update|group:delete

POST /api/groups/:id/join
Body: { email }
Response: Updated group (email added to joinRequests) + Socket: group:update

POST /api/groups/:id/join-requests/:action  (action: approve|reject)
Body: { email, requesterEmail }
Response: Updated group + Socket: group:update

POST /api/groups/:id/members/promote
Body: { email, requesterEmail }
Response: Updated group + Socket: group:update

POST /api/groups/:id/members/demote
Body: { email, requesterEmail }
Response: Updated group + Socket: group:update

DELETE /api/groups/:id/members/:email?requesterEmail=
Response: Updated group + Socket: group:update

POST /api/groups/:id/leave
Body: { email }
Response: Updated group + Socket: group:update

POST /api/groups/:id/messages
Body: { sender, content?, imageUrl?, fileUrl?, fileName?, fileType? }
Response: Updated group with new message + Socket: group:update

DELETE /api/groups/:id/messages/:messageId?requesterEmail=
Response: Updated group + Socket: group:update

DELETE /api/groups/:id?requester=
Response: { ok: true } + Socket: group:delete
```

### News

```
GET  /api/news/live
Response: { articles, total, lastRefreshed, nextRefreshIn }

GET  /api/news/live/stats
Response: { totalLive, totalArchive, lastRefreshed, nextRefreshIn, refreshHistory }

POST /api/news/refresh           (Manual trigger)
Response: { success, newCount, updatedCount }
Socket: → global: NEWS_FEED_UPDATED
Socket: → global: NEWS_BREAKING (if keywords match)

GET  /api/news/archive?category=&source=&tag=&search=&dateFrom=&dateTo=&sortBy=&sortOrder=&page=&limit=
Response: { articles, pagination: { page, limit, total, totalPages, hasNext, hasPrev } }

GET  /api/news/archive/tags
Response: [{ _id, count }]
```

### Admin (Teacher Management)

```
GET  /api/admin/teachers
Response: [UserProfile] (role: teacher only)

PATCH /api/admin/teachers/:email
Body: { status: 'approved'|'rejected' }
Response: Updated user

DELETE /api/admin/teachers/:email
Response: { ok: true }
```

### System

```
GET /api/health
Response: { ok: true }

GET /api/test/:id
Response: { id, message }
```

---

## 7. Socket.io Events Reference

### Client → Server (Listeners)

| Event | Payload | Purpose |
|---|---|---|
| `USER_VIEWING_EVENT` | `{ eventId }` | Join `event:{eventId}` room |
| `USER_LEFT_EVENT` | `{ eventId }` | Leave `event:{eventId}` room |

### Server → Client (Emitters)

| Event | Room | Payload | Purpose |
|---|---|---|---|
| `ACTIVE_USERS_UPDATE` | `global` | `[{ email, role, socketId }]` | Online user list update |
| `notice:create` | broadcast | Notice object | New notice posted |
| `notice:delete` | broadcast | noticeId | Notice removed |
| `lostfound:create` | broadcast | LostFound object | New report |
| `lostfound:update` | broadcast | LostFound object | Item claimed |
| `lostfound:delete` | broadcast | itemId | Report removed |
| `resource:create` | broadcast | Resource object | Resource uploaded |
| `group:create` | broadcast | Group object | Group created |
| `group:update` | broadcast | Group object | Group data changed |
| `group:delete` | broadcast | groupId | Group deleted |
| `APPROVAL_REQUEST_RECEIVED` | `approval_queue` | Event object | Student submitted request |
| `EVENT_CREATED` | `eventhub` | Event object | Event published / approved |
| `EVENT_UPDATED` | `eventhub` + `event:{id}` | Event object | Event details changed |
| `EVENT_DELETED` | `eventhub` + `event:{id}` | `{ eventId }` / `{ message }` | Event cancelled |
| `EVENT_POSTPONED` | `eventhub` + `event:{id}` | Event object / `{ reason, newDate }` | Event postponed |
| `APPROVAL_APPROVED` | `user:{email}` | `{ message, eventId }` | Request approved notification |
| `APPROVAL_REJECTED` | `user:{email}` | `{ message, reason }` | Request rejected notification |
| `APPROVAL_QUEUE_UPDATED` | `approval_queue` | Event object | Queue refreshed for reviewers |
| `NOTIFICATION_NEW` | `user:{email}`, `teachers`, `admins`, `global` | `{ message, type, eventId? }` | In-app notification bell |
| `NEWS_FEED_UPDATED` | `global` | `{ newArticles, updatedArticles, totalNew, fetchedAt, sources }` | Live news refresh |
| `NEWS_BREAKING` | `global` | `{ article, matchedKeyword, timestamp }` | Breaking news alert |
| `NEWS_REFRESH_COUNTDOWN` | `global` | `{ secondsUntilRefresh, lastRefreshed }` | Countdown timer sync |
| `NEWS_STATS_UPDATE` | `global` | `{ totalLive, totalArchive }` | Stats panel update |

### Socket Rooms

| Room | Members |
|---|---|
| `global` | All authenticated users |
| `students` | All users with role `student` |
| `teachers` | All users with role `teacher` |
| `admins` | All users with role `admin` |
| `approval_queue` | Teachers + Admins |
| `eventhub` | Users subscribed to event updates |
| `user:{email}` | Private room per user (email-keyed) |
| `event:{eventId}` | Users currently viewing that event |

---

## 8. Environment Variables

### Server (`server/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.net/db` |
| `PORT` | ✅ | HTTP server port | `4000` |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name | `mycloudname` |
| `EXPO_PUBLIC_CLOUDINARY_API_KEY` | ✅ | Cloudinary API key | `123456789` |
| `EXPO_PUBLIC_CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret | `abc-xyz-secret` |
| `EXPO_PUBLIC_CLOUDINARY_FOLDER` | ✅ | Upload folder path | `campusconnect/uploads/` |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ | Cloudinary upload preset | `CampusConnect` |
| `NEWS_REFRESH_INTERVAL_MS` | ❌ | Live news poll interval | `60000` (60s) |
| `NEWS_ARCHIVE_SAVE_INTERVAL_MS` | ❌ | Archive save interval | `300000` (5m) |
| `NEWS_CLEANUP_INTERVAL_MS` | ❌ | Archive cleanup interval | `3600000` (1h) |
| `NEWS_LIVE_WINDOW_HOURS` | ❌ | Hours before article leaves live feed | `24` |
| `NEWS_RECENT_WINDOW_DAYS` | ❌ | Days in "recent" bucket | `7` |
| `NEWS_WEEKLY_WINDOW_DAYS` | ❌ | Days in "weekly" bucket | `30` |
| `GNEWS_API_KEY` | ❌ | Optional GNews API key | _(empty = disabled)_ |
| `NEWSAPI_KEY` | ❌ | Optional NewsAPI.org key | _(empty = disabled)_ |

### Frontend (`.env` in root)

| Variable | Required | Description |
|---|---|---|
| `VITE_NEWS_REFRESH_INTERVAL` | ❌ | Client-side refresh hint | `60000` |
| `VITE_NEWS_MAX_BOOKMARKS` | ❌ | Max bookmarks in AsyncStorage | `100` |

> **Note:** The primary API URL is set in `src/api/client.ts` as `API_BASE_URL`. Update this for production deployment.

---

## 9. Installation & Setup

### 9.1 Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9+ or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your iOS or Android device (or a simulator)
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier works)

### 9.2 Clone the Repository

```bash
git clone https://github.com/your-org/CampusConnectCur.git
cd CampusConnectCur
```

### 9.3 Install Dependencies

```bash
# Frontend (root)
npm install

# Backend (server)
cd server
npm install
cd ..
```

### 9.4 Configure Environment Variables

```bash
# Server configuration
cp server/.env.example server/.env
```

Edit `server/.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas URI
- `EXPO_PUBLIC_CLOUDINARY_*` — your Cloudinary credentials
- `PORT=4000`

Update `src/api/client.ts` with your server IP/URL:
```typescript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:4000';
```

> ⚠️ Use your machine's LAN IP (e.g., `192.168.1.x:4000`), not `localhost`, for physical device testing.

### 9.5 Seed the Database

```bash
cd server
npx ts-node src/seed_data.ts
```

This creates the two Global Admin accounts and any initial seed data.

### 9.6 Running the Project

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
```
Server starts at `http://localhost:4000`

**Terminal 2 — Expo App:**
```bash
# From project root
npm start
# or
npx expo start
```

### 9.7 Running on Device

| Platform | Command / Action |
|---|---|
| **iOS** | Press `i` in terminal, or scan QR with Camera app |
| **Android** | Press `a`, or scan QR with Expo Go app |
| **Web** | Press `w`, then visit `http://localhost:8081` |

### 9.8 Production Build

```bash
# Web export
npm run build:web

# Server production start
cd server && npm run build && npm start
```

---

## 10. User Roles & Workflows

### 10.1 Student Workflow

```
1. Open app → GetStarted screen
2. Register with email, name, phone, school, designation
   → Account auto-approved (status: approved)
3. Login → MainDrawer unlocked
4. Browse Events → View approved events
5. Submit Event Request → status: pending
   → Teachers/Admins notified in real-time
6. Check Notification Bell → See approval decision
7. Join Study Groups → Send join request → Admin approves
8. Browse Tech News → Read live feed, save bookmarks
```

### 10.2 Teacher Workflow

```
1. Register → status: pending (cannot login yet)
2. Global Admin approves teacher account
3. Login → Full access unlocked
4. Review Events tab → Approvals sub-tab visible
5. Approve or Reject student event requests (with reason)
6. Create events directly (appear as approved immediately)
7. Manage Study Groups they created
8. Post notices to departments
```

### 10.3 Global Admin Workflow

```
1. Login with seeded admin account
2. Directed to Admin Dashboard
3. Review pending teacher registrations → Approve/Reject/Delete
4. Navigate to Events → Full CRUD + Postpone + Delete
5. Receive all notification broadcasts
6. Moderate Study Groups: remove members, delete groups
7. Access all data regardless of school scope
```

### 10.4 Event Approval Flowchart

```
Student
  │
  ▼
POST /api/events/request
  │
  ▼
Event status = "pending"
  │
  ├─ Socket → approval_queue → APPROVAL_REQUEST_RECEIVED
  ├─ Socket → teachers → NOTIFICATION_NEW
  └─ Socket → admins → NOTIFICATION_NEW
                │
                ▼
        Teacher/Admin opens
        APPROVALS tab
                │
         ┌──────┴──────┐
       APPROVE       REJECT
         │              │
         ▼              ▼
  status='approved'  Must enter reason
  Socket →           (min 5 chars)
  eventhub:          status='rejected'
  EVENT_CREATED      Socket →
         │           user:{email}:
         ▼           APPROVAL_REJECTED
  Student notified       │
  APPROVAL_APPROVED      ▼
  NOTIFICATION_NEW   Student notified
                     APPROVAL_REJECTED
                     NOTIFICATION_NEW
```

---

## 11. Real-Time Architecture

### 11.1 Socket.io Room Architecture

```
┌──────────────────────────────────────────────────┐
│                 SOCKET ROOMS                     │
├──────────────────────────────────────────────────┤
│ "global"         → All authenticated users       │
│ "students"       → All role='student' users      │
│ "teachers"       → All role='teacher' users      │
│ "admins"         → All role='admin' users        │
│ "approval_queue" → Teachers + Admins             │
│ "eventhub"       → Subscribed via USER_VIEWING   │
│ "user:{email}"   → Private per-user room         │
│ "event:{eventId}"→ Users viewing a specific event│
└──────────────────────────────────────────────────┘
```

### 11.2 Connection Flow

1. Client connects with `auth: { email, role }` in Socket.io handshake.
2. Server middleware extracts and attaches `socket.user`.
3. Socket automatically joins `global`, `user:{email}`, and role-based rooms.
4. Client receives `ACTIVE_USERS_UPDATE` with online user list.
5. On disconnect, user removed from `onlineUsers` map and update broadcast.

### 11.3 Reconnection Strategy

- `reconnection: true` with `reconnectionAttempts: Infinity`.
- Delay: starts at 1000ms, max 5000ms.
- Mobile: `@react-native-community/netinfo` monitors connectivity — reconnects socket on network restore.
- Transport: `['websocket']` only (no polling fallback — required for React Native).

---

## 12. News Feed Architecture

### 12.1 Background Ralph Loops (Server)

| Loop | Interval | Purpose |
|---|---|---|
| `LIVE_NEWS_LOOP` | 60 seconds | Fetch from HN + Dev.to, deduplicate, broadcast deltas |
| `ARCHIVE_SAVE_LOOP` | 5 minutes | Bulk upsert live cache to MongoDB NewsArchive |
| `CLEANUP_LOOP` | 1 hour | Recategorise archive entries: live→recent→weekly→deep_archive |
| `COUNTDOWN_EMITTER` | 10 seconds | Broadcast `NEWS_REFRESH_COUNTDOWN` to sync client timers |

### 12.2 Fetch Strategy

```
fetchAllNews()
  ├── fetchHackerNews()    → Algolia HN API (top 30 front_page hits)
  └── fetchDevToNews()     → 5 tag queries in parallel (programming, webdev, ai, javascript, opensource)
          │
          ▼
  Deduplicate by URL
          │
          ▼
  Compare against liveNewsCache
  ├── New URL → push to newArticles[]
  └── Existing URL → update score/comments if changed → push to updatedArticles[]
          │
          ▼
  Sort by publishedAt DESC
          │
          ▼
  Filter: keep only last 24h (NEWS_LIVE_WINDOW_HOURS)
          │
          ▼
  Log to NewsRefreshLog
          │
          ▼
  Return { newArticles, updatedArticles, allLive, sourcesActive }
```

### 12.3 Breaking News Detection

Keywords checked against `article.title.toLowerCase()`:
`breaking, critical, urgent, major, acquired, merger, bankrupt, shuts down, launches, breakthrough, vulnerability, breach, hack, outage, down, gpt, openai, google, apple, microsoft, meta, funding, ipo, layoffs`

If matched: `NEWS_BREAKING` emitted to `global` room.

---

## 13. Global Admin Accounts

> ⚠️ **These accounts are seeded into the database via `seed_data.ts`.**

| Role | Email | Access |
|---|---|---|
| Global Admin | `aman@admin.com` | Full system access |
| Global Admin | `pranav@admin.com` | Full system access |

> 🔒 **Change these passwords immediately in any production deployment.**

---

## 14. Known Issues & Troubleshooting

### 14.1 Known Issues

- **No JWT authentication** — User sessions rely on email stored in client context. Adding JWT tokens is recommended for production.
- **Notice deletion unprotected** — Any user can DELETE notices; the `createdBy` field is missing from the schema. Restrict in production.
- **`exactOptionalPropertyTypes: true`** — TypeScript strict mode requires explicit `T | undefined` annotation on optional interface fields.
- **Expo version mismatch** — `expo@54.0.33`, `expo-constants@18.0.13`, `expo-video@3.0.16` are the canonical versions.

### 14.2 Common Errors

**`TypeError: window.addEventListener is not a function`**
```
Cause: Browser-only API used in a React Native context
Fix:   Replace with:
       import NetInfo from '@react-native-community/netinfo';
       const unsub = NetInfo.addEventListener(state => { ... });
       return () => unsub();
```

**`TypeError: localStorage is not defined`**
```
Cause: Browser Storage API not available in React Native
Fix:   Import and use storage.ts wrapper (AsyncStorage):
       import { storage } from '../utils/storage';
       await storage.getItem(key);
```

**`TS2412: Type 'number | undefined' is not assignable to type 'number'`**
```
Cause: exactOptionalPropertyTypes: true in tsconfig.json
Fix:   Change field type from: score?: number
                           to: score?: number | undefined
       And guard assignments: if (v !== undefined) existing.score = v;
```

**Socket connect → disconnect → connect loop**
```
Cause: useEffect missing cleanup or re-running due to dependency array
Fix:   - Use a mounted flag
       - Set transports: ['websocket'] in socket options
       - Add [] empty dependency array if connection should init once
```

**Server not reachable from Expo Go on physical device**
```
Cause: Using 'localhost' as API_BASE_URL
Fix:   Change API_BASE_URL in src/api/client.ts to your LAN IP:
       export const API_BASE_URL = 'http://192.168.1.X:4000';
```

---

## 15. Project Stats

| Metric | Count |
|---|---|
| Total Screens | 16 |
| Total Components | 4 |
| Total Custom Hooks | 2 (`useLiveNews`, `useNewsArchive`) |
| Total Context Providers | 4 (`Auth`, `Socket`, `Theme`, `Toast`) |
| Total API Endpoints | 47 |
| Total Socket Events (Server→Client) | 20 |
| Total Socket Events (Client→Server) | 2 |
| Total Database Collections | 9 |
| Total Mongoose Schemas | 10 |
| Frontend Dependencies | 26 |
| Backend Dependencies | 12 |
| Lines of Code (server/index.ts) | ~1,177 |
| Lines of Code (newsService.ts) | ~283 |

---

## 16. Contributing

### Development Guidelines

- All TypeScript strict mode rules must pass.
- All optional fields in interfaces must be typed as `fieldName?: Type | undefined`.
- Use `storage.ts` wrapper for all persistent storage (never raw `localStorage`).
- Use `NetInfo.addEventListener` for network events (never `window.addEventListener`).
- Socket events MUST be prefixed consistently: `SCREAMING_SNAKE_CASE` for client events, `snake:verb` for data CRUD events.

### Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready, stable |
| `develop` | Active development integration |
| `feature/xxx` | Individual feature branches |
| `fix/xxx` | Bug fix branches |

### Commit Convention

```
feat: add news archive pagination
fix: resolve window.addEventListener RN compatibility
docs: update README with full API reference
refactor: extract newsService to dedicated module
style: format EventsScreen.tsx
test: add validation for approval flow
```

---

*Built with ❤️ by the TeamRocket Team*
