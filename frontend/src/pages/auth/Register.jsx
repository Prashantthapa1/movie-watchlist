import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mapAuthError } from "../../services/authErrorMapper";
import Input from "../../shared/Input";
import Button from "../../shared/Button";
import EmailVerificationService from "../../services/EmailVerificationService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  // success message removed per user request (immediate redirect instead)

  useEffect(() => {
    if (!generalError) return;
    const id = setTimeout(() => setGeneralError(""), 4000);
    return () => clearTimeout(id);
  }, [generalError]);

  // removed success message effect

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setGeneralError("");
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = "Username is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";

    if (!formData.password) e.password = "Password is required";
    else {
      if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
      else if (!/[a-z]/.test(formData.password)) e.password = "Password must include a lowercase letter";
      else if (!/[A-Z]/.test(formData.password)) e.password = "Password must include an uppercase letter";
      else if (!/[0-9]/.test(formData.password)) e.password = "Password must include a number";
    }

    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Send verification code instead of direct registration
      const response = await EmailVerificationService.sendVerificationCode({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role || 'user'
      });

      if (response.success) {
          // Navigate to email verification page with email
          navigate('/verify-email', { 
              state: { email: formData.email }
          });
      } else {
          // Use mapAuthError to provide better error messages
          const errorMessage = response.message || 'Registration failed';
          const mapped = mapAuthError(errorMessage, { 
            context: 'register', 
            duplicateUsernameGeneral: true 
          });
          
          // Set field-specific errors if any
          if (mapped.fieldErrors && Object.keys(mapped.fieldErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
          }
          
          // Set general error
          if (mapped.generalError) {
            setGeneralError(mapped.generalError);
          } else {
            setGeneralError(errorMessage);
          }
      }   
    } catch (err) {
      // Handle network/unexpected errors with mapAuthError
      const errorMessage = err?.message || "Registration failed. Please try again.";
      const mapped = mapAuthError(errorMessage, { 
        context: 'register', 
        duplicateUsernameGeneral: true 
      });
      
      if (mapped.fieldErrors && Object.keys(mapped.fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
      }
      
      if (mapped.generalError) {
        setGeneralError(mapped.generalError);
      } else {
        setGeneralError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h2>

  {generalError && <p className="text-red-500 text-sm mb-4" role="alert">{generalError}</p>}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <Input
            id="username"
            name="username"
            type="text"
            label="Username"
            placeholder="Enter username..."
            required
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter email..."
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="New Password"
            placeholder="Enter new password..."
            required
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            showToggle
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm password..."
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
            showToggle
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending verification code...
              </div>
            ) : (
              'Register'
            )}
          </Button>
        </form>

        <hr className="my-4 border-gray-200" />
        <div className="flex justify-end items-center">
          <p className="text-gray-600 text-sm mr-2">Already have an account?</p>
          <Link to="/login" className="text-blue-500 text-sm hover:underline">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
