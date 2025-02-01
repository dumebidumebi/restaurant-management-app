"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SelectItemsTable } from "../ItemsManager/selectItemsTable";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@prisma/client";
import { getItems } from "../ItemsManager/itemsManager";
import { X, XIcon } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
});

export function CreateCategoryForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!user) return;

      async function createCategory(userId: string, data: object) {
        const settings = await fetch("/api/category/create-category", {
          method: "POST",
          body: JSON.stringify({ userId: userId, data: data }),
        }).then((res) => res.json());
        return settings;
      }

      console.log("createCategory");
      await createCategory(user.id, {
        ...values,
        items: selectedItems,
      });
      onSubmitSuccess();
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Submission error:", error);
    }
  }

  const handleSubmitSuccess = async () => {
    try {
      if (!user?.id) return;
      const updatedItems = await getItems(user.id);
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
      const updatedItems = await getItems(user.id);
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
      await fetch("/api/category/delete-category", {
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

  const handleOptimisticCopy = async (item: Item) => {
    const tempId = `copy-${Date.now()}`;
    const copiedItem = { ...item, id: tempId };

    // Optimistic update
    setItems((prev) => [...prev, copiedItem]);

    try {
      const response = await fetch("/api/copy-item", {
        method: "POST",
        body: JSON.stringify({ data: item }),
      });
      const newItem = await response.json();

      // Replace temporary ID with real ID from server
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? { ...newItem, id: newItem.id } : i))
      );
      toast({ title: "Items copied successfully!" , variant: "default"});
    } catch (error) {
      // Revert on error
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      toast({
        title: "Failed to copy item",
        variant: "destructive",
      });
    }
  };

  const handleOptimisticEdit = async (updatedItem: Item) => {
    const originalItems = items;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    try {
      await fetch("/api/edit-item", {
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

  useEffect(() => {
    const fetchItems = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const items = await getItems(user.id);
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

  const handleAddItems = () => {
    console.log("added some items", selectedItems);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        form.reset();
        setIsDialogOpen(!isDialogOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="ml-20 min w-30 mb-2">
          Create Category
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md flex flex-col space-y-5 justify-between max-h-svh overflow-scroll">
        {!selectingItems ? (
          <div>
            <DialogHeader>
              <DialogTitle className="my-4">Create New Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Display Name */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* items selection */}
                <div>
                  <p className="font-medium text-sm mb-3">Items</p>
                  <Button
                    onClick={() => setSelectingItems(true)}
                    variant={"outline"}
                    className="w-full"
                  >
                    Select Items
                  </Button>
                  {!selectedItems.length && (
                    <p className="font-light text-sm my-3">
                      No items selected yet.
                    </p>
                  )}
                  {selectedItems.map((item) => (
                    <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                      <div className="flex flex-row items-center space-x-4 mx-5">
                        <Image
                          width={10}
                          height={10}
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <p className="text-sm leading-none">{item.name}</p>
                      </div>
                      <div className="flex flex-row items-center space-x-4 mx-5">
                        <p className="text-sm leading-none">${item.price}</p>
                        {/* Add leading-none */}
                        <Button
                          onClick={() => {
                            setSelectedItems((prev) =>
                              prev.filter((i) => i.id !== item.id)
                            );
                          }}
                          className="h-6 w-6 p-1 ml-2" // Increased size and added padding
                          variant="outline"
                        >
                          <XIcon className="h-4 w-4" />
                          {/* Set explicit icon size */}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Create Category
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle className="my-4">Select Category Items</DialogTitle>
            </DialogHeader>
            <SelectItemsTable
              data={items}
              onDelete={handleOptimisticDelete}
              onCopy={handleOptimisticCopy}
              onEdit={handleOptimisticEdit}
              selectedItems={undefined} // 
              onUpdateSuccess={handleUpdateSuccess}
              onSelectionChange={setSelectedItems}
              onUpdateError={(error: Error) => {
                toast({
                  title: "Failed to update item",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
            <div className="flex flex-row justify-evenly">
              <Button
                className="min-w-32"
                variant={"outline"}
                onClick={() => setSelectingItems(false)}
              >
                Cancel
              </Button>
              <Button
                className="min-w-32"
                onClick={() => {
                  setSelectingItems(false);
                  handleAddItems();
                }}
              >
                Add Items
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
