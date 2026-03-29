# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Global Search**: Implemented a comprehensive search interface supporting users, events, and resources.
- **Onboarding Flow**: Added a fluid, paginated onboarding experience for first-time users.
- **Academic Calendar Widget**: A dynamic calendar widget integrated into the Notice board summarizing key dates.
- **Attendance Tracker**: Introduced a "Mark Present" component in `GroupChatScreen.tsx` for live study sessions.
- **Offline Banner**: Added a global connection monitor that drops down alerting users to network loss.
- **Event Reactions**: Added interactive reaction buttons mapping to the new `reactions` field on the backend `EventSchema`.
- **Admin Dashboard Extensions**: Added missing API endpoints (`/api/admin/teachers`, `/api/admin/broadcast`, `/api/admin/stats`) and integrated socket broadcast functionality to client terminals.
- **Empty States & Skeleton Loaders**: Integrated standard UX components across all Data Lists.

### Changed
- **UI Revamp**: Refactored `NoticesScreen`, `LostFoundScreen`, `EventsScreen`, `AdminDashboardScreen`, `SearchScreen`, `PendingScreen`, and `RejectedScreen` to use the global `ThemeContext` (Dark/Light Mode compatible).
- **Socket Providers**: Subscribed global context to `ADMIN_BROADCAST` to show instantaneous App-wide alerts.
- **Architecture**: Separated UI primitives (e.g. `EmptyState`, `SkeletonLoader`) into `src/components/ui/` yielding cleaner tree structures.

### Fixed
- **API Disconnects**: Fixed Admin Teacher approval/rejection endpoints that were missing from backend service.
