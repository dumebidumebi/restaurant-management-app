// Add these imports at the top of ItemsTable
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit, MousePointerClick, XIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Category, Item, Menu, ModifierGroup } from "@prisma/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as Bytescale from "@bytescale/sdk";
import { SelectModifierGroupsTable } from "../ModifierGroupsManager/selectModifierGroupsTable";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useUser } from "@clerk/nextjs";
import { getModifierGroups } from "../ModifierGroupsManager/modifierGroupsManager";
import { SelectCategoriesTable } from "../CategoriesManager/selectCategoriesTable";
import { getCategories } from "../CategoriesManager/categoryManager ";
// Add this component inside your ItemsTable file

const formSchema = z.object({
  name: z.string().min(1, "Display name is required"),
});
export function EditMenuDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: Menu & { categories: Category[] }; // Explicitly include the items relation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await fetch("/api/menu/edit-menu", {
        method: "POST",
        body: JSON.stringify({
          data: {
            id: item.id,
            name: values.name,
            categories: selectedItems,
          },
        }),
      }).then((res) => res.json());

      onSuccess();
      setSelectedItems([]);
      setSelectingItems(false);
      toast({ title: "Item updated successfully!" });
    } catch (error) {
      toast({
        title: "Failed to update item",
        variant: "destructive",
      });
    }
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

  useEffect(() => {
    setSelectedItems(item.categories.length ? [...item.categories] : []);
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen h-fit overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
        <DialogHeader>
          <DialogTitle className="mt-4">Edit Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Keep all other form fields from your create form */}
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

            {/* Modifier Groups */}
            <div className="border-slate-200 border-1 border-y py-8 ">
              <h3 className="font-medium mb-2">Categories</h3>
              <p className="text-gray-400 text-sm mb-2">
                Cateries are groups of items. You might have a category like
                "combos", "drinks", "sides".
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
                      onClick={() => setSelectingItems(false)}
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
                handleSubmit(form.getValues());
              }}
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
