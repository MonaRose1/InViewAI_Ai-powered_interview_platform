# InViewAI Platform: Comprehensive Testing Report

This document provides a detailed breakdown of the testing suites conducted for the InViewAI AI-powered interview platform. It covers White Box, Black Box, and GUI testing methodologies to ensure system integrity, functionality, and user experience.

---

## 1. White Box Test Cases (Logic & Architecture)
White box testing focuses on the internal structure, code logic, and backend API integrity.

| ID | Test Title | Description | Pre-conditions | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| WBT-01 | DB Connectivity | Verify backend connects to MongoDB Atlas using URI. | `.env` contains valid `MONGO_URI`. | "MongoDB connected" logged on startup. | **Pass** |
| WBT-02 | Password Hashing | Verify `bcrypt` hashes passwords before saving to DB. | User registration logic is active. | No plain-text passwords stored in DB. | **Pass** |
| WBT-03 | JWT Auth Token | Verify token generation on successful login. | Valid user credentials provided. | RSA/HMAC signed token returned in response. | **Pass** |
| WBT-04 | Rate Limiting | Ensure auth endpoints block brute-force attempts. | Multiple requests in < 1 second. | Server returns `429 Too Many Requests`. | **Pass** |
| WBT-05 | RBAC (Admin) | Verify `/api/admin` routes reject non-admin users. | Logged in as `Candidate`. | Returns `403 Forbidden`. | **Pass** |
| WBT-06 | Socket Room Init | Verify unique room ID creation for sessions. | Interview session started. | Socket joins room matching Interview ID. | **Pass** |
| WBT-07 | AI Proxy Payload | Verify frame analysis sends valid Base64 data. | Camera active during interview. | AI service receives valid JSON with image string. | **Hybrid** |
| WBT-08 | Model Validation | Verify `Interview` model requires `candidateId`. | Create interview without ID. | Mongoose returns Validation Error. | **Pass** |
| WBT-09 | CORS Policy | Ensure unauthorized domains cannot access API. | Request from `evil-site.com`. | Browser blocks request via CORS header. | **Pass** |
| WBT-10 | Error Middleware | Verify global handler catches runtime exceptions. | Trigger undefined variable in route. | Returns JSON `{ error: "Internal Server Error" }`. | **Pass** |
| WBT-12 | Environment Var | Verify all required keys exist in process.env. | Server initialization. | Server throws error if `JWT_SECRET` is missing. | **Pass** |

---

## 2. Black Box Test Cases (Functional & User Requirements)
Black box testing focuses on the external behavior of the system based on user stories.

| ID | Test Title | Description | Pre-conditions | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| BBT-01 | Successful Login | Candidate logs into dashboard with valid email. | User account exists in DB. | Redirects to `/dashboard`. | **Pass** |
| BBT-02 | Invalid Search | Search for non-existent job title. | Search bar is active. | Displays "No jobs found for [term]". | **Pass** |
| BBT-03 | Job Application | Candidate submits resume for a listing. | Logged in; resume uploaded. | Application appears in "Applied" tab. | **Pass** |
| BBT-04 | Join Interview | Candidate clicks interview link from email. | Interview slot is currently active. | Enters video session room successfully. | **Pass** |
| BBT-05 | AI Real-time Feedback | System displays "Analyzing..." during session. | Camera frame sent to AI. | UI updates with behavior metrics. | **Hybrid** |
| BBT-06 | Admin Job Creation | Admin adds a new job with specific skills. | Logged in as Admin. | Job appears instantly on public board. | **Pass** |
| BBT-07 | Chat Messaging | Real-time chat between interviewer/candidate. | Both users in same room. | Messages appear without page refresh. | **Pass** |
| BBT-08 | Profile Update | User changes profile picture and bio. | Profile page open. | Changes persist after page reload. | **Pass** |
| BBT-09 | Interview Ending | Session closes for both parties after timer. | Timer reaches 00:00. | Redirects to "Thank You" or "Feedback" page. | **Pass** |
| BBT-10 | Question Flow | Interviewer pushes question set to candidate. | Socket connection active. | Candidate sees question overlay instantly. | **Pass** |
| BBT-12 | Session Persistence | Refresh page during interview. | Middle of a session. | User reconnects to same room automatically. | **Pass** |

---

## 3. GUI Test Cases (UI/UX & Design)
GUI testing focuses on the visual presentation and interaction of the frontend.

| ID | Test Title | Description | Pre-conditions | Expected Result | Status |
|:---|:---|:---|:---|:---|:---|
| GUI-01 | Responsive Navbar | Hamburger menu appears on mobile screens. | Viewport width < 768px. | Navbar collapses into clickable icon. | **Pass** |
| GUI-02 | Button Feedback | Buttons change color/scale on hover. | Mouse hovering over "Apply". | Clear visual state change (CSS transition). | **Pass** |
| GUI-03 | Modal Accessibility | Close modal using 'ESC' key or backdrop. | Job detail modal is open. | Modal closes instantly. | **Pass** |
| GUI-04 | Form Input Error | Red borders on mandatory empty fields. | Click "Submit" on empty form. | Inputs outlined in red with error text. | **Pass** |
| GUI-05 | Loading State | Skeletons or Spinners during data load. | Slow network simulated. | UI shows loading indicators, not blank space. | **Pass** |
| GUI-06 | Typography hierarchy | Headers are distinctly larger than body text. | Any page with H1/H2. | Visual consistency in font weights. | **Pass** |
| GUI-07 | Dark Mode Toggle | UI colors switch between themes correctly. | Profile settings open. | Background/Text colors invert as expected. | **Pass** |
| GUI-08 | Video Ratio | Local video preview maintains 16:9 ratio. | Camera permission granted. | Preview box doesn't stretch or distort. | **Hybrid** |
| GUI-09 | Toast Positioning | Error alerts appear in top-right corner. | Failed action triggered. | Notification pops up without blocking core UI. | **Pass** |
| GUI-10 | Dashboard Layout | Grid items align properly on Tablet. | Viewport width 1024px. | Cards stack or resize without overlapping. | **Pass** |
| GUI-11 | Icon Clarity | Icons use high-res SVG assets. | Zoom in 200%. | Icons remain sharp and clear. | **Pass** |
| GUI-12 | Tooltip Visibility | Tooltips show on hovering small action icons. | Icons like 'Delete' or 'Edit'. | Descriptive text appears after 0.5s delay. | **Pass** |

---

## 4. Summary of Test Results

### Pass/Fail/Hybrid Overview

| Result Category | Count | Description |
|:---|:---|:---|
| **Pass** | 31 | Test cases met all expected results perfectly. |
| **Hybrid** | 3 | Functional but needs minor polish or optimization (AI payload, Video ratio). |

> [!NOTE]
> The "Hybrid" results for AI Proxy and Video Ratio are due to minor latency or aspect ratio inconsistencies in specific browser versions, though the core functionality is operational.

---
*End of Testing Report*
