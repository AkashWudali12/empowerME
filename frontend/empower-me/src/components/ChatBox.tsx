'use client'

import { Textarea } from "./ui/textarea";
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { LoadingSpinner } from "./loading";

export function ChatBox() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    alert("Submit: " + message)

    setLoading(true); // Show loading spinner

    const formData = new FormData();

    setLoading(false); // Hide loading spinner
  };

  return (
    <div className="flex items-center justify-center">
        {loading ? (
          <LoadingSpinner /> // Show loading spinner if loading state is true
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Textarea
                placeholder="Type your message..."
                className="w-full rounded-lg text-foreground px-4 py-2 pr-16 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={1}
                value={message}
                onChange={handleMessageChange}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground hover:text-foreground"
              >
                <SendIcon className="w-5 h-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        )}
    </div>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function SendIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}
