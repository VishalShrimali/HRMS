import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      console.log("Login Response:", data); 

      if (response.ok && data.token) {
        console.log("Token received:", data.token); // ✅ Check if token is received
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminName", data.admin?.fullName || "Admin");
      
        setIsAuthenticated(true);
        navigate("/dashboard");
      }
       else {
        alert(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  const handleRegister = () => {
    navigate("/register"); // Redirect to Register page
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password"); // Redirect to Forgot Password page
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded mb-2"
          />
          <button type="submit" className="bg-blue-500 text-white py-2 rounded mb-2">
            Login
          </button>
        </form>
        <div className="text-center">
          <button onClick={handleForgotPassword} className="text-blue-500 text-sm mb-2">
            Forgot Password?
          </button>
          <div className="flex justify-center items-center">
            <span className="text-sm text-gray-500 mr-2">Don't have an account?</span>
            <button onClick={handleRegister} className="text-blue-500 text-sm">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
