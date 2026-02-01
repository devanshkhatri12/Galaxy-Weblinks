/**
 * Contact Map Component
 *
 * Displays an interactive map showing the office location
 * using Leaflet and OpenStreetMap
 */

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dynamically import Leaflet to avoid SSR issues
const DynamicMap = dynamic(() => import("./map-content"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted flex items-center justify-center rounded-lg">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface ContactMapProps {
  title?: string;
  description?: string;
}

export function ContactMap({
  title = "Our Location",
  description = "Visit us at our office",
}: ContactMapProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DynamicMap />
      </CardContent>
    </Card>
  );
}
