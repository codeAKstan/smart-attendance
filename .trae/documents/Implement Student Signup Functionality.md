I will implement the student signup functionality by creating a new backend API route and connecting it to the existing frontend form.

### 1. Backend: Create Signup API (`app/api/auth/signup/route.ts`)
*   Create a new **POST** route to handle registration.
*   **Validation**: Check if the email already exists.
*   **Security**: Hash the password using `bcryptjs`.
*   **Database**: Create a new `User` document with the role set to `'STUDENT'`.
*   **Fields**: Save `name`, `email`, `password` (hashed), and `studentId`.

### 2. Frontend: Connect Signup Page (`screens/SignUp.tsx`)
*   **State Management**: Add React state to capture form inputs (`name`, `studentId`, `email`, `password`, `confirmPassword`).
*   **Validation**: Ensure "Password" and "Confirm Password" match before submitting.
*   **API Integration**: Send the form data to `/api/auth/signup`.
*   **Feedback**:
    *   Show a loading spinner during submission.
    *   Display error messages (e.g., "Email already exists").
    *   On success, show a success message and redirect the user to the Login screen.

### 3. Verification
*   Create a new student account via the Signup UI.
*   Verify that I can log in with the new credentials.
