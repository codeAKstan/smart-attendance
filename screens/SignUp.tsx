
import React, { useState } from 'react';

interface SignUpProps {
  onBackToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullname,
          studentId: formData.studentId,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
      // Optional: Auto-redirect after a delay
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
          <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Created!</h2>
        <p className="text-slate-500 text-center mb-8">Redirecting you to login...</p>
        <button 
          onClick={onBackToLogin}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark p-6">
      <div className="flex justify-center mb-6 mt-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
        </div>
      </div>
      <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center">
        Join Your Class
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pt-3 text-center max-w-xs mx-auto mb-8">
        Enter your details to register for the Smart Attendance System.
      </p>

      <form className="flex-1 flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {[
          { label: 'Full Name', id: 'fullname', icon: 'person', type: 'text', placeholder: 'John Doe' },
          { label: 'Student Reg No', id: 'studentId', icon: 'badge', type: 'text', placeholder: 'e.g., 20231015' },
          { label: 'Email', id: 'email', icon: 'mail', type: 'email', placeholder: 'name@university.edu' },
          { label: 'Password', id: 'password', icon: 'lock', type: 'password', placeholder: '••••••••' },
          { label: 'Confirm Password', id: 'confirmPassword', icon: 'lock', type: 'password', placeholder: '••••••••' },
        ].map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal" htmlFor={field.id}>{field.label}</label>
            <div className="relative">
              <input 
                className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white border-none bg-slate-200/50 dark:bg-slate-800 h-14 px-4 text-base focus:ring-2 focus:ring-primary/20" 
                id={field.id} 
                placeholder={field.placeholder} 
                type={field.type}
                required
                value={(formData as any)[field.id]}
                onChange={handleChange}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">{field.icon}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-auto pt-8 pb-8">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full h-14 bg-primary hover:bg-blue-600 active:scale-[0.98] text-white text-base font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              'Sign Up'
            )}
          </button>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
            Already have an account? 
            <button type="button" onClick={onBackToLogin} className="text-primary font-semibold ml-1 hover:underline">Log in</button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
