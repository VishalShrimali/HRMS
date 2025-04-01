import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminName", data.admin?.fullName || "Admin");
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-light text-[#1F2937] text-center mb-6">
          Sign In
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#2DD4BF] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#2DD4BF] transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#2DD4BF] text-white text-sm font-medium rounded-md hover:bg-[#26A69A] transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-[#1F2937] space-y-2">
          <Link to="/forgot-password" className="hover:text-[#2DD4BF] transition-colors">
            Forgot Password?
          </Link>
          <p>
            New here?{" "}
            <Link to="/register" className="text-[#2DD4BF] hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;