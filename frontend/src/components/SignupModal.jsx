import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { Link } from "react-router-dom"

export function SignupModal() {


  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="relative bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          <Link to ='/'> <X className="w-5 h-5" /></Link>
        </button>
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form>
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
                <Button type="submit" className="w-full">Create Account</Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full flex items-center gap-2 justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor" />
                  </svg>
                  Sign up with Google
                </Button>
              </div>
              
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to = '/login'>
                  
                  Sign in</Link>
                
                 </div>
            </form>
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}