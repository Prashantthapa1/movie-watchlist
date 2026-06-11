import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import Input from "../../shared/Input";
import Button from "../../shared/Button";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.username))
      newErrors.username = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData);
    if (!result.success) {
      setGeneralError(result.error);
      return;
    }

    // redirect based on role
    const user = result.user;
    if (user && user.role === "admin") navigate("/admin/dashboard");
    else navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {generalError && (
        <p className="text-red-500 text-sm mb-4">{generalError}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          name="username"
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="email"
          error={errors.username}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          error={errors.password}
          showToggle
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
        <hr className="my-4 border-gray-200" />
        <div className="flex justify-end items-center">
          <p className="text-gray-600 text-sm mr-2">Don't have an account?</p>
          <Link to="/register" className="text-blue-500 text-sm hover:underline">Register Here</Link>
        </div>
    </div>
  );
};

export default Login;
