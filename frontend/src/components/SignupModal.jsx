import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const register = import.meta.env.VITE_REGISTER; // ✅ Fixed: Corrected environment variable name
const google_login = import.meta.env.VITE_GOOGLE_LOGIN; // ✅ Fixed: Corrected environment variable name

export function SignupModal() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Fixed: Proper fetch syntax & response validation
  const handleLoginSuccess = async (credentialResponse) => {
    const decodedUser = jwtDecode(credentialResponse.credential);

    try {
      const response = await fetch(google_login, {
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

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
            <Link to="/">
              <X className="w-5 h-5" />
            </Link>
          </button>
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Enter your details below to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  const password = e.target.password.value;
                  const username = email.split("@")[0];

                  try {
                    const response = await fetch(register, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password, username }),
                    });

                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                    const text = await response.text();
                    const data = text ? JSON.parse(text) : {};

                    if (data.token) {
                      localStorage.setItem("token", data.token);
                      setUser(data.user);
                      navigate("/dashboard");
                    }
                  } catch (error) {
                    console.error("Error:", error);
                  }
                }}
              >
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" required />
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Create Account
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Authentication Section */}
                  {user ? (
                    <div className="text-center">
                      <h2>Welcome, {user.name}</h2>
                      <img src={user.picture} alt="Profile" className="mx-auto rounded-full w-16 h-16" />
                      <Button onClick={handleLogout} variant="outline" className="w-full mt-2">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />
                  )}
                </div>
                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
