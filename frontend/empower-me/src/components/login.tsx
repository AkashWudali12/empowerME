"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL

console.log("backend url:", backend_url)

export function Login() {
  const [patientId, setPatientId] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(backend_url + "login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "pid": patientId })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("sessionToken", data["sessionToken"])
      router.push("/patientDashboard");
    } else {
      alert("No patient with patientId " + patientId + " found.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Enter your patient ID to sign in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pID">Patient ID</Label>
            <Input
              id="pID"
              placeholder="123456789"
              required
              value={patientId} // Bind the input value to the state variable
              onChange={(e) => setPatientId(e.target.value)} // Update state on input change
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 md:flex-row md:justify-between">
          <Button type="submit" className="w-full md:w-auto">
            Sign In
          </Button>
          {/* <Link href="#" className="text-center text-sm text-primary hover:underline md:text-left" prefetch={false}>
            Don't have an account? Contect your healthcare provider
          </Link> */}
        </CardFooter>
        </form>
      </Card>
    </div>
  )
}
