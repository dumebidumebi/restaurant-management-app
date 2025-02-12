"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
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
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import * as Bytescale from "@bytescale/sdk";
import { Modifier, ModifierGroup } from "@prisma/client";
import { SelectModifiersTable } from "../ModifiersManager/selectModifiersTable"; // Ensure this import is correct
import { getModifiers } from "../ModifiersManager/modifiersManager"; // Ensure this import is correct
import { useUser } from "@clerk/nextjs";

const formSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  minSelect: z.coerce.number().nonnegative(),
  maxSelect: z.coerce.number().positive(),
});

export function EditModifierGroupDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: ModifierGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Modifier[]>([]);
  const [items, setItems] = useState<Modifier[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name || "",
      minSelect: item.minSelect ?? 0,
      maxSelect: item.maxSelect ?? 10,
    },
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!user) return;
        const fetchedItems = await getModifiers(user?.id); // Adjust this if user ID is needed
        setItems(fetchedItems);
      } catch (error) {
        toast({
          title: "Failed to load items",
          variant: "destructive",
        });
      }
    };

    fetchItems();
  }, []);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await fetch("/api/modifier-group/edit-modifier-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            id: item.id,
            name: values.name,
            minSelect: Number(values.minSelect),
            maxSelect: Number(values.maxSelect),
            isAvailable: item.isAvailable ?? true,
            availability: item.availability,
            modifiers: selectedItems, // Include selected modifiers
          },
        }),
      });

      onSuccess();
      onOpenChange(false);
      toast({ title: "Modifier updated successfully!" });
    } catch (error) {
      toast({
        title: "Failed to update modifier",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    setSelectedItems([...item.modifiers]);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-between">
        <DialogHeader>
          <DialogTitle className="mt-4">Edit Modifier</DialogTitle>
        </DialogHeader>
        {!selectingItems ? (
          <Form {...form}>
            <form
              // onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Display Name */}
              <FormField
                control={form.control}
                name="name"
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

              {/* Minimum */}
              <FormField
                control={form.control}
                name="minSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Maximum */}
              <FormField
                control={form.control}
                name="maxSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum (leave blank for no limit)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Modifiers Selection */}
              <p className="font-medium text-sm mb-3">Modifiers</p>
              <Button
                onClick={() => setSelectingItems(true)}
                variant={"outline"}
                className="w-full"
              >
                Select Modifiers
              </Button>
              {!selectedItems.length && (
                <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <p className="font-light text-sm my-3 mx-5">
                    No modifiers selected yet.
                  </p>
                </div>
              )}
              {selectedItems.map((item) => (
                <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <div className="flex flex-row items-center space-x-4 mx-5">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <p className="text-sm leading-none ">{item.name}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-4 mx-5">
                    <p className="text-sm leading-none">${item.price}</p>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedItems((prev) =>
                          prev.filter((i) => i.id !== item.id)
                        );
                      }}
                      className="h-6 w-6 p-1 ml-2"
                      variant="outline"
                    >
                      <span className="h-4 w-4">X</span>
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="submit"
                className="w-full"
                onClick={async (e) => {
                  e.preventDefault();
                  await handleSubmit(form.getValues());
                  setSelectedItems([]);
                  form.reset();
                }}
              >
                Save Changes
              </Button>
            </form>
          </Form>
        ) : (
          <div>
            <SelectModifiersTable
              data={items}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
            />
            <div className="flex flex-row justify-evenly mt-4">
              <Button
                variant={"outline"}
                onClick={() => setSelectingItems(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSelectingItems(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
