"use client";

import * as React from "react";
import Script from "next/script";

import { Roboflow } from "@/components/roboflow";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [showCamera, setShowCamera] = React.useState(false);

  return (
    <>
      <div className="min-h-screen py-4 md:py-8 flex flex-col mx-auto w-max">
        <div className="grow flex flex-col items-center space-y-4">
          <h1 className="text-2xl md:text-4xl">Barranco movement</h1>
          <Button onClick={() => setShowCamera(!showCamera)}>
            {showCamera ? "Hide" : "Show"} camera
          </Button>
          {showCamera && <Roboflow />}
        </div>

        <p className="text-center text-sm">© 2024 Anthony Cueva</p>
      </div>

      <Script
        id="roboflowScript"
        src="https://cdn.roboflow.com/0.2.26/roboflow.js"
      />
    </>
  );
}
