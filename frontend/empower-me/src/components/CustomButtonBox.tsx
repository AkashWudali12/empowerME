"use client"

import Link from "next/link"
import { send } from "process";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";


interface ButtonBoxProps {
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
}

export function CustomButtonBox({ title, description, imageUrl, altText }: ButtonBoxProps) {
  // Ensure sendTo is a string and not undefined

  const [hrefValue, setHrefValue] = useState("#");

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");

    if (title === "Patients") {
      if (sessionToken) {
        setHrefValue("/patientDashboard")
        console.log("Button Box has token")
      }
      else {
        setHrefValue("/patientLogin")
        console.log("Button Box does not have token")
      }
    }
    else {
      setHrefValue("#")
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group hover:shadow-xl hover:-translate-y-2">
      <Link href={hrefValue} className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View</span>
      </Link>
      <img
        src={imageUrl}
        alt={altText}
        width={300}
        height={300}
        className="object-cover w-full h-48"
        style={{ aspectRatio: "300/300", objectFit: "cover" }}
      />
      <div className="p-4 bg-background">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}