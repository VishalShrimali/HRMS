import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-light text-[#1F2937] text-center mb-6">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#2DD4BF] transition-colors"
          />
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
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#1F2937]">
          Already registered?{" "}
          <Link to="/login" className="text-[#2DD4BF] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;