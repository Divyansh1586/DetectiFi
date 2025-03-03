import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { setAuth } from "@/lib/auth";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const LOGIN_URL = import.meta.env.VITE_LOGIN;
const GOOGLE_LOGIN_URL = import.meta.env.VITE_GOOGLE_LOGIN;

export function LoginModal() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Google Login Success Handler
  const handleLoginSuccess = async (credentialResponse) => {
    const decodedUser = jwtDecode(credentialResponse.credential);

    try {
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

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      if (data.token) {
        setAuth(data.token, data.user);
        setUser(data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Google login failed. Please try again.");
    }
  };

  // ✅ Logout Handler
  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  // ✅ Handle Form Submission for Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        if (response.status === 409 || data.message === "Email does not exist") {
          setError("Invalid email ID.");
        } else {
          setError("Login failed. Please try again.");
        }
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/dashboard");
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
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to log in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              {/* {error && <p className="text-red-500 text-sm">{error}</p>} */}
              {/* {error && <p className="text-red-500 text-sm text-center mt-2 block">{error}</p>} */}
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="ml-auto text-sm underline">
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Login
                  </Button>

                  {/* ✅ Google Authentication Section */}
                  {user ? (
                    <div className="text-center">
                      <h2>Welcome, {user.name}</h2>
                      <img src={user.picture} alt="Profile" className="mx-auto rounded-full w-16 h-16" />
                      <Button onClick={handleLogout} variant="outline" className="w-full mt-2">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <GoogleLogin onSuccess={handleLoginSuccess} onError={() => setError("Google Login Failed")} />
                  )}
                </div>
              </form>

              <Link to="/signup">
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account? <button className="underline">Sign up</button>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
