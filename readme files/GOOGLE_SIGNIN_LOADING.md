# Google Sign-In Loading Indicator

## Overview
Added loading indicators to all Google sign-in modals (Student, Coordinator/SPOC, and Recruiter) to provide visual feedback during the authentication process.

## Changes Made

### 1. Added Loading State Variables
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L51-L54)

```javascript
// Loading states for Google sign-in
const [studentGoogleLoading, setStudentGoogleLoading] = useState(false);
const [spocGoogleLoading, setSpocGoogleLoading] = useState(false);
const [recruiterGoogleLoading, setRecruiterGoogleLoading] = useState(false);
```

### 2. Updated Success Handlers

#### Student Handler
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L127-L160)
- Sets `studentGoogleLoading` to `true` when processing starts
- Resets to `false` on error
- Page reload clears the state automatically on success

#### SPOC Handler
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L169-L204)
- Sets `spocGoogleLoading` to `true` when processing starts
- Resets to `false` on error
- Page reload clears the state automatically on success

#### Recruiter Handler
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L207-L241)
- Sets `recruiterGoogleLoading` to `true` when processing starts
- Resets to `false` on error
- Page reload clears the state automatically on success

### 3. Updated GoogleModal Component
**File:** [frontend/src/components/Auth/GoogleModal.jsx](frontend/src/components/Auth/GoogleModal.jsx#L4-L42)

**Added:**
- `loading` prop to accept loading state
- Loading overlay with spinner and message
- Disabled close button when loading
- Semi-transparent white overlay to prevent interaction

**Loading UI:**
```jsx
{loading && (
  <div className="absolute inset-0 bg-white/90 rounded-lg flex flex-col items-center justify-center z-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
    <p className="text-sm text-gray-600">Signing you in...</p>
  </div>
)}
```

### 4. Updated Modal Invocations

#### Student Modal
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L387-L395)
```jsx
<GoogleModal
  role="Student"
  setShowGoogleModal={setShowStudentGoogleModal}
  handleGoogleSuccess={handleGoogleSuccess}
  handleGoogleError={handleGoogleError}
  loading={studentGoogleLoading}
/>
```

#### SPOC Modal
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L398-L406)
```jsx
<GoogleModal
  role="spoc"
  setShowGoogleModal={setShowSpocGoogleModal}
  handleGoogleSuccess={handleSpocGoogleSuccess}
  handleGoogleError={handleSpocGoogleError}
  loading={spocGoogleLoading}
/>
```

#### Recruiter Modal
**File:** [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx#L408-L457)
- Added loading overlay directly in the modal (supports both Google and LinkedIn)
- Disabled close button when loading
- Shows "Signing you in..." message

## User Experience

### Before
- User clicks Google sign-in button
- Google consent appears
- After consent, no visual feedback
- Page reloads suddenly

### After
- User clicks Google sign-in button
- Google consent appears
- After consent, loading spinner appears immediately
- "Signing you in..." message displayed
- Modal prevents interaction during loading
- Close button is disabled
- Page reloads after processing complete

## Visual Design

The loading overlay features:
- **Spinner:** Blue animated spinner (12x12, border-b-2)
- **Background:** Semi-transparent white (bg-white/90)
- **Message:** "Signing you in..." in gray text
- **Z-index:** 10 (above modal content)
- **Positioning:** Absolute, covers entire modal
- **Animation:** Tailwind's `animate-spin` class

## Error Handling

If authentication fails:
1. Loading state is immediately set to `false`
2. Error alert is shown to user
3. Modal remains open for retry
4. Close button is re-enabled

## Testing

### Test Student Login
1. Click on "Student" role card
2. Google modal opens
3. Click "Sign in with Google" button
4. Complete Google consent
5. ✅ Loading spinner should appear
6. ✅ "Signing you in..." message should show
7. ✅ Close button should be disabled
8. Page should reload after processing

### Test SPOC Login
1. Click on "Coordinator" role card
2. Google modal opens
3. Click "Sign in with Google" button
4. Complete Google consent
5. ✅ Loading spinner should appear
6. ✅ "Signing you in..." message should show
7. ✅ Close button should be disabled
8. Page should reload after processing

### Test Recruiter Login
1. Click on "Recruiter" role card
2. Sign-in modal opens (Google and LinkedIn options)
3. Click "Sign in with Google" button
4. Complete Google consent
5. ✅ Loading spinner should appear
6. ✅ "Signing you in..." message should show
7. ✅ Close button should be disabled
8. Page should reload after processing

### Test Error Scenario
1. Trigger a sign-in error (disconnect internet, invalid credentials, etc.)
2. ✅ Loading spinner should disappear
3. ✅ Error alert should appear
4. ✅ Modal should remain open
5. ✅ Close button should be re-enabled

## Files Modified

1. **[frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)**
   - Added 3 loading state variables
   - Updated all success/error handlers
   - Updated modal invocations with loading props
   - Added loading overlay to recruiter modal

2. **[frontend/src/components/Auth/GoogleModal.jsx](frontend/src/components/Auth/GoogleModal.jsx)**
   - Added `loading` prop
   - Added loading overlay UI
   - Disabled close button when loading

## Benefits

1. **Better UX:** Users get immediate visual feedback
2. **Prevents Confusion:** Clear indication that processing is happening
3. **Prevents Duplicate Actions:** Modal interaction disabled during loading
4. **Professional Feel:** Smooth transition with proper loading states
5. **Error Recovery:** Clean error handling with ability to retry

## Technical Notes

- Loading state is managed at the parent (Login.jsx) level
- Each role has its own independent loading state
- GoogleModal is a reusable component that accepts loading prop
- Recruiter modal has inline loading (to support both Google and LinkedIn)
- Page reload automatically clears loading states
- Error handlers properly reset loading states
