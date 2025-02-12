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
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import * as Bytescale from "@bytescale/sdk";
import { Select } from "../ui/select";
import { SelectItemsTable } from "../ItemsManager/selectItemsTable";
import { toast } from "@/hooks/use-toast";
import { Modifier } from "@prisma/client";
import { SelectModifiersTable } from "../ModifiersManager/selectModifiersTable";
import { getModifiers } from "../ModifiersManager/modifiersManager";
import { MousePointerClick, XIcon } from "lucide-react";
import Image from "next/image";
import { getModifierGroups } from "./modifierGroupsManager";

async function createModifierGroup(userId: string, data: object) {
  const settings = await fetch("/api/modifier-group/create-modifier-group", {
    method: "POST",
    body: JSON.stringify({ userId: userId, data: data }),
  }).then((res) => res.json());
  return settings;
}

export function CreateModifierGroupForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const items = await getModifiers(user.id);
          setModifiers(items);
          console.log("items", items);
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
  const formSchema = z.object({
    name: z.string().min(1, "Display name is required"),
    description: z.string().min(1, "Description is required"),
    minSelect: z.coerce.number().nonnegative(),
    maxSelect: z.coerce.number().positive(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      minSelect: 0,
      maxSelect: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form:", values);
    try {
      if (!user) return;

      await createModifierGroup(user.id, {
        ...values,
        minSelect: Number(values.minSelect),
        maxSelect: Number(values.maxSelect),
        modifiers: selectedItems,
      });

      onSubmitSuccess();
      form.reset();
      setImageUrl("");
      setIsDialogOpen(false);
    } catch (error) {}
  }

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
          Create Modifier Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-between">
        {!selectingItems ? (
          <div>
            <DialogHeader>
              <DialogTitle className="mt-4">
                Create New Modifier Group
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                // onSubmit={form.handleSubmit(onSubmit)}
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

                {/* modifiers selection */}

                <p className="font-medium text-sm mb-3">Modifiers</p>
                <Button
                  onClick={() => setSelectingItems(true)}
                  variant={"outline"}
                  className="w-full"
                >
                  Select Modifiers <MousePointerClick />
                </Button>
                {!selectedItems.length && (
                  <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                    <p className="font-light text-sm my-3 mx-5">
                      No modifiers selected yet.
                    </p>
                  </div>
                )}
                {selectedItems.map((item) => (
                  <div className="outline flex  rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                    <div className="flex flex-row items-center space-x-4 mx-5">
                      {item.imageUrl && (
                        <Image
                          width={10}
                          height={10}
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <p className="text-sm leading-none ">{item.name}</p>
                    </div>
                    <div className="flex flex-row items-center space-x-4 mx-5">
                      <p className="text-sm leading-none">${item.price}</p>
                      {/* Add leading-none */}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
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

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onSubmit(form.getValues());
                    setSelectedItems([]);
                    form.reset();
                    setIsDialogOpen(!isDialogOpen);
                  }}
                >
                  Create Modifier
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <DialogTitle className="my-4">Select Modifiers</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-scroll">
              <SelectModifiersTable
                data={modifiers}
                selectedItems={selectedItems} //
                onSelectionChange={setSelectedItems}
              />
            </div>
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
                onClick={(e) => {
                  e.preventDefault();
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
