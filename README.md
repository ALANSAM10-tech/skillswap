# College Skill Swap Platform

A decentralized, peer-to-peer skill exchange platform exclusive to college campuses. It bridges the gap between knowledge-seeking and knowledge-sharing students through campus matching, connection workflows, and AI-driven personalized learning paths.

## Key Features

- **Match Discovery**: Segmented matching engine identifying Mutual Matches (Perfect Swaps), Mentors, and Students.
- **Connection Workflow**: Inbox to manage incoming/outgoing swap requests, coordinate communication, and securely reveal coordinates once connected.
- **AI Learning Paths**: Custom learning roadmap builder that breaks down goals into steps and maps them to on-campus mentors offering those skills.
- **Expert Mentor Tier**:
  - **Verified Expert Badges**: Institutional expert status display on profiles and directories.
  - **Scheduler & Workshops**: Availability scheduler for expert mentors to host group workshops or 1-on-1 office hours.
  - **Ratings & Reviews**: 1-to-5 star post-session feedback system built on community trust with reviewer constraints.

## Tech Stack

- **Frontend**: React, Vite, Framer Motion, Vanilla CSS (Glassmorphism layout), Lucide React
- **Backend**: Node.js, Express, Local File Storage (JSON database layer)
- **APIs**: AI-powered custom learning path generation (OpenAI/Gemini fallback keyword system)

## Setup & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ALANSAM10-tech/skillswap.git
   cd skillswap
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
   *Note: This starts both the frontend and backend servers concurrently.*
