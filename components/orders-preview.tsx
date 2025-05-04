// app/(landing-page)/components/orders-preview.tsx
"use client";

import OrdersPage from "@/app/(dashboard-app)/store/orders/page"; // Adjust the import path to your actual OrdersPage component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StaticOrdersPreviewContent from "./static-orders-preview-content";

export default function OrdersPreview() {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-muted/50 p-3 border-b">
        <CardTitle className="text-sm font-medium">
          Live Order Manager Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Container to constrain the OrdersPage */}
        <div className="h-[600px] overflow-y-auto relative">
          {/* 
             NOTE: The OrdersPage component needs to be compatible with being
             rendered here. It might need adjustments if it relies heavily on
             layout context or specific props not available here.
             Ensure its internal fetch works or provide dummy data if needed for preview.
          */}
          <StaticOrdersPreviewContent />
        </div>
      </CardContent>
    </Card>
  );
}
