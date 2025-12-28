# Requirements: Remove Authentication and Simplify Application

## Overview

Transform the ComfyUI Image Generator application from a multi-user authenticated system to a simplified single-user public application.

## User Requirements

### 1. Remove Authentication
- Remove all Better Auth authentication logic
- Remove Google OAuth integration
- Remove user-related database tables and columns
- Remove all authentication UI components (sign-in, sign-out, user profile)
- Remove protected route handling

### 2. Change Default Page
- Make the generate page the default landing page (at `/`)
- Remove the current home/landing page
- Remove the profile/settings page

### 3. Remove User-Specific Features
- Remove per-user API key storage
- Remove user-specific galleries
- Remove like functionality (requires user tracking)
- Remove public/private visibility toggle (all images are public)

### 4. Remove Gemini Integration
- Remove Google AI/Gemini SDK dependency
- Stub the image generation functionality
- Remove API key management UI and hooks

### 5. Simplify Gallery
- Keep a single public gallery showing all generated images
- Remove user-specific gallery views
- Remove like counts and like buttons

## Technical Requirements

### Database Changes
- Remove tables: `user`, `session`, `account`, `verification`, `userApiKeys`, `imageLikes`
- Remove `userId` column from: `avatars`, `presets`, `generations`
- Remove `isPublic` column from: `generatedImages`

### Dependency Removal
- Remove `better-auth` package
- Remove `@google/genai` package

### Environment Variables
- Remove: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Out of Scope
- Unit testing
- E2E testing
- New feature development
- Performance optimization

## Assumptions
- Existing data will be lost during migration (destructive change)
- The stub generation will return placeholder/mock data
- All generated content is considered public
