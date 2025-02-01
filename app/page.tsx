"use client";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { BANNER, MENU } from "@/constants";
import banner from "@/images/banner-img.png";
import { ChevronRight, TextQuote } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const allItems = Object.values(MENU.categories).flat();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const refreshedCompany = await fetch("/api/menu", {
          method: "POST",
          body: JSON.stringify({ message: "got message" }),
        }).then((res) => res.json());
        console.log(refreshedCompany);

        setData(refreshedCompany);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div>
        <h1>Data from Database</h1>

        {data ? `${data}` : "loading"}
      </div>
    </>
  );
}
