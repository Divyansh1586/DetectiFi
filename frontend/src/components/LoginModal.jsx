import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";


const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

export function LoginModal() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // ✅ Initialize useNavigate for redirection

  const handleLoginSuccess = async (credentialResponse) => {
    const decodedUser = jwtDecode(credentialResponse.credential);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: decodedUser.email,
          name: decodedUser.name,
          googleId: decodedUser.sub,
          picture: decodedUser.picture
        })
      });

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
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
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  const password = e.target.password.value;

                  try {
                    const response = await fetch('http://localhost:5000/api/auth/login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    if (data.token) {
                      localStorage.setItem('token', data.token);
                      setUser(data.user);
                      navigate('/dashboard');
                    }
                  } catch (error) {
                    console.error('Error:', error);
                  }
                }}>
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
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
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

