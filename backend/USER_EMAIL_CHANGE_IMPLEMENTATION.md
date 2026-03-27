# Email Change Functionality Implementation

## Summary
Implemented complete email change functionality with verification code flow, connecting the frontend `EmailChangeModal.jsx` with the backend.

## Backend Changes

### 1. Model: `backend/users/models.py`
- Added `EmailChangeRequest` model to store verification requests
- Fields: user (FK), new_email, verification_code (6 digits), is_verified, created_at, expires_at, used_at
- Methods: `is_expired()`, `is_valid()`

### 2. Repository Interface: `backend/users/domain/repositories/user_repository.py`
- Added methods:
  - `create_email_change_request(user_id, new_email, verification_code, expires_at)`
  - `get_email_change_request_by_code(code)`
  - `mark_email_change_verified(request_id)`

### 3. Repository Implementation: `backend/users/infrastructure/repositories/django_user_repository.py`
- Implemented all new repository methods with `@sync_to_async`
- Uses Django ORM to manage EmailChangeRequest objects

### 4. Use Cases

#### `backend/users/application/use_cases/request_email_change.py`
- `RequestEmailChangeUseCase`: Generates 6-digit code, creates request, sends verification email
- Validates that new email is different from current
- Prevents duplicate pending requests
- Sets expiration to 30 minutes

#### `backend/users/application/use_cases/confirm_email_change.py`
- `ConfirmEmailChangeUseCase`: Verifies code and updates user's email
- Checks: request exists, not verified, not expired, belongs to user
- Marks request as verified and updates user.email

### 5. Serializers: `backend/users/serializers.py`
- `EmailChangeRequestSerializer`: validates `new_email` field
- `EmailChangeConfirmSerializer`: validates `verification_code` (6 digits)

### 6. Views: `backend/users/views.py`
- `EmailChangeRequestView` (POST `/api/email/change/verification/`): Authenticated users only
- `EmailChangeConfirmView` (POST `/api/email/change/confirmation/`): Authenticated users only
- Both use async_to_sync to execute use cases
- Return appropriate JSON responses matching frontend expectations

### 7. URLs: `backend/users/urls.py`
- Added routes:
  - `path('email/change/verification/', EmailChangeRequestView.as_view(), name='email_change_verification')`
  - `path('email/change/confirmation/', EmailChangeConfirmView.as_view(), name='email_change_confirmation')`

### 8. Email Templates
- `backend/users/templates/email/email_change_verification.html` - Professional HTML email
- `backend/users/templates/email/email_change_verification.txt` - Plain text fallback
- Templates include: user username, new email, verification code, expiration warning

## Frontend Compatibility

The existing `EmailChangeModal.jsx` component already expects:
- POST `/api/email/change/verification/` with `{ new_email: string }`
  - Success: 200 OK
  - Error: `{ error: string }` (400)
- POST `/api/email/change/confirmation/` with `{ verification_code: string }`
  - Success: 200 OK with `{ detail: string, new_email: string }`
  - Error: `{ error: string }` (400)

The backend implementation matches these expectations exactly.

## Database Migration

Migration file `0005_emailchangerequest.py` should be created (if not already):
```bash
cd backend
python manage.py makemigrations users
python manage.py migrate users
```

## Testing Checklist

1. Ensure backend server is running
2. Authenticate as a user and obtain JWT token (stored in localStorage)
3. Open the EmailChangeModal component
4. Enter a new email (different from current) and click "Enviar código"
5. Check that verification email is received (or check console for email content in development)
6. Enter the 6-digit code and click "Confirmar cambio"
7. Verify that the user's email is updated and success state is shown

## Notes

- The email sending uses Django's `EmailMultiAlternatives` with HTML and text templates
- The system prevents duplicate pending requests for the same new email
- Verification codes expire after 30 minutes
- Only authenticated users can request email changes
- The user can only verify their own request
- The frontend's MOCK_CODE display is for demo purposes only

## Security Considerations

- Verification codes are 6 digits (1,000,000 possibilities)
- Codes expire after 30 minutes
- Requests are tied to authenticated user sessions
- Email uniqueness is enforced at the database level (User.email is unique)
- Old verification requests are cleaned up automatically when new ones are created for the same email

## Potential Enhancements

- Add a cleanup management command to delete expired EmailChangeRequest records
- Add rate limiting to prevent abuse
- Add email confirmation that the old email receives when the change is completed
- Allow resend with a new code (currently resends the same code within countdown period)
