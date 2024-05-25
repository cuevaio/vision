"use client";

import * as React from "react";
import Script from "next/script";

import { Roboflow } from "@/components/roboflow";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function Home() {
  const [showCamera, setShowCamera] = React.useState(false);
  const { detections } = useStore();

  return (
    <>
      <div className="min-h-screen py-4 md:py-8 flex flex-col mx-auto w-max">
        <div className="grow flex flex-col items-center space-y-4">
          <h1 className="text-2xl md:text-4xl">Barranco movement</h1>

          <div className="flex space-x-4">
            <Button onClick={() => setShowCamera(!showCamera)}>
              {showCamera ? "Turn on" : "Turn off"} camera
            </Button>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">See detections</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Detections</DrawerTitle>
                  <DrawerDescription>
                    {detections.length
                      ? "The following objects have been detected:"
                      : "No objects detected. Please continue recording"}
                  </DrawerDescription>
                </DrawerHeader>
                <ul className="space-y-2 font-mono">
                  {detections.map((detection, i) => (
                    <li key={i}>
                      {detection.detClass} ({detection.confidence})
                    </li>
                  ))}
                </ul>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button>OK</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
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
