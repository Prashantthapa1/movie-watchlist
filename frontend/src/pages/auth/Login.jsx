import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import { mapAuthError } from "../../services/authErrorMapper";
import Input from "../../shared/Input";
import Button from "../../shared/Button";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({}); // field-level errors
  const [generalError, setGeneralError] = useState("");

  // clear general error after a short time
  useEffect(() => {
    if (!generalError) return;
    const id = setTimeout(() => setGeneralError(""), 4000);
    return () => clearTimeout(id);
  }, [generalError]);

  const validate = () => {
    const e = {};
    if (!formData.username.trim()) e.username = "Username or email is required";
    // don't force email format since username OR email is allowed
    if (!formData.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // clear field error while typing
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // login expects an object (the AuthContext should send it to /auth/login)
      const result = await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (!result.success) {
        const msg = result.error || "Invalid credentials";
        const mapped = mapAuthError(msg, { context: 'login' });
        setErrors(prev => ({ ...prev, ...mapped.fieldErrors }));
        if (mapped.generalError) setGeneralError(mapped.generalError);
        return;
      }

      // success - redirect by role
      const user = result.user;
      if (user && user.role === "admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      // unexpected error fallback
      setGeneralError(err?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h2>

  {generalError && <p className="text-red-500 text-sm mb-4" role="alert">{generalError}</p>}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <Input
            id="username"
            name="username"
            type="text"
            label="Username or Email"
            placeholder="Enter username or email..."
            required
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter password..."
            required
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            showToggle
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="text-gray-600 text-sm ml-2">Remember Me</label>
            </div>
            <Link to="/forgot-password" className="text-blue-500 text-sm hover:underline">Forgot Password?</Link>
          </div>

          <Button type="submit" className="w-full">Login</Button>
        </form>

        <hr className="my-4 border-gray-200" />
        <div className="flex justify-end items-center">
          <p className="text-gray-600 text-sm mr-2">Don't have an account?</p>
          <Link to="/register" className="text-blue-500 text-sm hover:underline">Register Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
