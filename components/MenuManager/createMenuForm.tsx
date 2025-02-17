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
import { MousePointerClick, XIcon } from "lucide-react";
import { SelectModifierGroupsTable } from "../ModifierGroupsManager/selectModifierGroupsTable";
import { Category, ModifierGroup } from "@prisma/client";
import { getModifierGroups } from "../ModifierGroupsManager/modifierGroupsManager";
import { toast } from "@/hooks/use-toast";
import { getCategories } from "../CategoriesManager/categoryManager ";
import { SelectCategoriesTable } from "../CategoriesManager/selectCategoriesTable";

const formSchema = z.object({
  name: z.string().min(1, "Display name is required"),
});

async function createMenu(userId: string, data: object) {
  const settings = await fetch("/api/menu/create-menu", {
    method: "POST",
    body: JSON.stringify({ userId: userId, data: data }),
  }).then((res) => res.json());
  return settings;
}

export function MenusForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState("");
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form:", selectedItems);
    try {
      if (!user) return;

      await createMenu(user.id, {
        ...values,
        categories: selectedItems,
      });

      onSubmitSuccess();
      // Reset form to default values
      form.reset();

      // Refresh items list after successful creation

      setImageUrl("");
      setIsDialogOpen(false);
    } catch (error) {}
  }

  useEffect(() => {
    const fetchItems = async () => {
      if (user?.id) {
        try {
          const items = await getCategories(user.id);
          setCategories(items);
          console.log("items", items);
        } catch (error) {
          toast({
            title: "Failed to load items",
            variant: "destructive",
          });
        } finally {
        }
      }
    };
    fetchItems();
  }, [user?.id]);
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        // Reset form to default values
        form.reset();
        setIsDialogOpen(!isDialogOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="ml-20 min w-30 mb-2">
          Create Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen h-fit overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
        <DialogHeader>
          <DialogTitle className="mt-4">Create New Menu</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            //  onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
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

            {/* Categories */}
            <div className="border-slate-200 border-1 border-y py-8 ">
              <h3 className="font-medium mb-2">Categories</h3>
              <p className="text-gray-400 text-sm mb-2">
                Categories contain a list of items. For example Entrees,
                Appetizers, Desserts.
              </p>

              <Dialog
                open={selectingItems}
                onOpenChange={() => setSelectingItems((prev) => !prev)}
              >
                <DialogTrigger>
                  <Button
                    variant={"default"}
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectingItems((prev) => !prev);
                    }}
                  >
                    Select Categories <MousePointerClick />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-full h-fit overflow-scroll">
                  <DialogHeader>
                    <DialogTitle>Select Categories</DialogTitle>
                  </DialogHeader>
                  <div className="">
                    <SelectCategoriesTable
                      data={categories}
                      selectedItems={selectedItems}
                      onSelectionChange={setSelectedItems}
                    />
                  </div>
                  <div className="flex flex-row justify-evenly">
                    <Button
                      className="min-w-32"
                      variant={"outline"}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectingItems(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="min-w-32"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectingItems(false);
                      }}
                    >
                      Add Categories
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {!selectedItems.length && (
                <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <p className="font-light text-sm my-3 mx-5">
                    No categories selected yet.
                  </p>
                </div>
              )}
              {selectedItems.map((item) => (
                <div className="outline flex  rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <div className="flex flex-row items-center space-x-4 mx-5">
                    <p className="text-sm leading-none ">{item.name}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-4 mx-5">
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
            </div>

            <Button
              type="submit"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                onSubmit(form.getValues());
                setSelectedItems([]);
                setSelectingItems(false);
                setIsDialogOpen(false);
              }}
            >
              Create Menu
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
