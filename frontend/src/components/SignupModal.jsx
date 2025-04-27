import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REGISTER_URL = import.meta.env.VITE_REGISTER;
const GOOGLE_LOGIN_URL = import.meta.env.VITE_GOOGLE_LOGIN;

const SignupModal = () => {
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Failed to get Google credentials");
      return;
    }

    try {
      const decodedUser = jwtDecode(credentialResponse.credential);
      if (!decodedUser?.email) {
        setError("Invalid Google account information");
        return;
      }

      const response = await fetch(GOOGLE_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: decodedUser.email,
          name: decodedUser.name,
          googleId: decodedUser.sub,
          picture: decodedUser.picture,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      if (!data.token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // store user data
      setUser(data.user);
      setError("");
      navigate("/login");
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.message || "Google login failed. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/login");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
            <Link to="/">
              <X className="w-5 h-5" />
            </Link>
          </button>

          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>Enter your details below to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <form onSubmit={handleSignup}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Sign Up
                  </Button>
                </div>
              </form>

              {/* Google Login Section */}
              <div className="mt-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => setError("Google Login Failed")}
                />
              </div>

              <Link to="/login">
                <div className="mt-4 text-center text-sm">
                  Already have an account? <button className="underline">Login</button>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignupModal;
