"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Separator } from "../ui/separator";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Item, Modifier } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import { ModifiersTable } from "./modifiersTable";
import { CreateModifierForm } from "./createModifierForm";


export async function getModifiers(userId: string) {
  const response = await fetch("/api/modifier/get-modifier", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: userId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}
export function ModifiersManager() {
  const { user } = useUser();
  const { toast } = useToast();
  const [items, setItems] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const items = await getModifiers(user.id);
          setItems(items);
        } catch (error) {
          toast({
            title: "Failed to load items",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchItems();
  }, [user?.id, toast]);

  const handleSubmitSuccess = async () => {
    try {
      if (!user?.id) return;
      const updatedItems = await getModifiers(user.id);
      setItems(updatedItems);

      toast({ title: "Items created successfully!" });
    } catch (error) {
      toast({
        title: "Failed to create items",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSuccess = async () => {
    try {
      if (!user?.id) return;
      const updatedItems = await getModifiers(user.id);
      setItems(updatedItems);
      toast({ title: "Items updated successfully!" });
    } catch (error) {
      toast({
        title: "Failed to refresh items",
        variant: "destructive",
      });
    }
  };

  const handleOptimisticDelete = async (itemId: string) => {
    const itemToDelete = items.find((item) => item.id === itemId);
    if (!itemToDelete) return;

    // Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await fetch("/api/modifier/delete-modifier", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });
    } catch (error) {
      // Revert on error
      setItems((prev) => [...prev, itemToDelete]);
      toast({
        title: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleOptimisticCopy = async (item: Modifier) => {
    const tempId = `copy-${Date.now()}`;
    const copiedItem = { ...item, id: tempId };

    // Optimistic update
    setItems((prev) => [...prev, copiedItem]);

    try {
      const response = await fetch("/api/modifier/copy-modifier", {
        method: "POST",
        body: JSON.stringify({ data: item }),
      });
      const newItem = await response.json();

      // Replace temporary ID with real ID from server
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...newItem, id: newItem.id } : i))
      );
    } catch (error) {
      // Revert on error
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      toast({
        title: "Failed to copy item",
        variant: "destructive",
      });
    }
  };

  const handleOptimisticEdit = async (updatedItem: Modifier) => {
    const originalItems = items;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    try {
      await fetch("/api/modifier/edit-modifier", {
        method: "POST",
        body: JSON.stringify({ data: updatedItem }),
      });
    } catch (error) {
      // Revert on error
      setItems(originalItems);
      toast({
        title: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card className="w-full ">
        <CardHeader>
          <div className="flex flex-row justify-between align-middle">
            <CardTitle className="mt-2">Modifiers</CardTitle>
            <CreateModifierForm onSubmitSuccess={handleSubmitSuccess} />
          </div>
          <Separator className="my-4" />
          <CardDescription>
            Manage your menu modifiers. Click "Create Modifier" to add new entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Existing items list would go here */}
          {loading ? (
            // Skeleton Loaders
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 border p-4 rounded-lg">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <ModifiersTable
              data={items}
              onDelete={handleOptimisticDelete}
              onCopy={handleOptimisticCopy}
              onEdit={handleOptimisticEdit}
              onUpdateSuccess={handleUpdateSuccess}
              onUpdateError={(error: Error) => {
                toast({
                  title: "Failed to update item",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
          ) : (
            <p className="text-gray-500">No modifiers created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
