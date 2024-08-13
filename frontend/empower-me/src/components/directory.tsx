"use client";

import { CustomButtonBox } from "./CustomButtonBox";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export function Directory() {
  const router = useRouter();

  const products: Product[] = [
    { id: 1, title: "Patients", description: "click here to login", imageUrl: "/placeholder.svg" },
    { id: 2, title: "Admin", description: "click here to login", imageUrl: "/placeholder.svg" },
  ];

  const l = products.length.toString();
  const boxesClassName = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${l} gap-6`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <section className="py-12 md:py-24 lg:py-32 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-4 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">EmpowerME</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl mx-auto">
              slogan.
            </p>
          </div>
          <div className={boxesClassName}>
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-center">
                <CustomButtonBox
                  title={product.title}
                  description={product.description}
                  imageUrl={product.imageUrl}
                  altText={product.title}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
