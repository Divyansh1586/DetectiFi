import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const LOGIN_URL = import.meta.env.VITE_LOGIN;
const GOOGLE_LOGIN_URL = import.meta.env.VITE_GOOGLE_LOGIN;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Subtle animated background
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900 animate-pulse-slow opacity-50 dark:opacity-30" />
    {/* Add more subtle elements if desired, e.g., slow moving shapes or particles */}
  </div>
);

const LoginModal = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

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

      const { data } = await axios.post(GOOGLE_LOGIN_URL, {
        email: decodedUser.email,
        name: decodedUser.name,
        googleId: decodedUser.sub,
        picture: decodedUser.picture,
      });

      if (!data.token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setError("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      setError(error.response?.data?.message || "Google login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { data } = await axios.post(LOGIN_URL, { 
        email, 
        password 
      });

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login successful, but user data missing.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-30 dark:bg-black dark:bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
        <AnimatedBackground />
        <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fade-in-up">
          <Link to="/" className="absolute top-3 right-3 text-gray-500 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </Link>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 dark:text-dark-text-secondary">Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 rounded-md text-center">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-dark-text-secondary">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="detective@example.com" required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-dark-border focus:ring-accent-red dark:focus:ring-dark-primary dark:text-dark-text" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-dark-text-secondary">Password</Label>
                    <Input id="password" name="password" type="password" required className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-dark-border focus:ring-accent-red dark:focus:ring-dark-primary dark:text-dark-text" />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 dark:bg-dark-primary text-white dark:text-dark-background py-3 text-base font-semibold transition-all duration-300 active:scale-95 focus:ring-4 focus:ring-red-300 dark:focus:ring-teal-800">
                    Login
                  </Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300 dark:border-dark-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-dark-surface px-2 text-gray-500 dark:text-dark-text-secondary">Or continue with</span>
                    </div>
                  </div>

                  {user ? (
                    <div className="text-center py-3">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Welcome, {user.name}</h2>
                      {user.picture && <img src={user.picture} alt="Profile" className="mx-auto rounded-full w-16 h-16 my-2 border-2 border-dark-primary" />}
                      <Button onClick={handleLogout} variant="outline" className="w-full mt-3 dark:text-dark-text dark:border-dark-border dark:hover:bg-gray-700">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center w-full my-2">
                      <GoogleLogin 
                        onSuccess={handleLoginSuccess} 
                        onError={() => setError("Google Login Failed")} 
                        theme={darkMode ? "filled_black" : "outline"}
                        width="100%"
                      />
                    </div>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600 dark:text-dark-text-secondary">Don&apos;t have an account? </span>
                <Link to="/signup" className="font-medium text-accent-red dark:text-dark-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginModal;
