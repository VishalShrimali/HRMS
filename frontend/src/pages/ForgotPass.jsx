import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Reset link sent to your email!");
        navigate("/login");
      } else {
        alert(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Reset Error:", error);
      alert("Error sending reset link.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-light text-[#1F2937] text-center mb-6">
          Reset Password
        </h2>
        <form onSubmit={handleResetRequest} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#2DD4BF] transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#2DD4BF] text-white text-sm font-medium rounded-md hover:bg-[#26A69A] transition-colors duration-200"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;