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
import { Item, ModifierGroup } from "@prisma/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as Bytescale from "@bytescale/sdk";
import { SelectModifierGroupsTable } from "../ModifierGroupsManager/selectModifierGroupsTable";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useUser } from "@clerk/nextjs";
import { getModifierGroups } from "../ModifierGroupsManager/modifierGroupsManager";

// Define the Allergen type
type AllergenKey = "DAIRY" | "EGGS" | "FISH" | "GLUTEN" | "PEANUTS" | "SOY" | "TREE_NUTS";

const allergensEnum = z.enum([
  "DAIRY",
  "EGGS",
  "FISH",
  "GLUTEN",
  "PEANUTS",
  "SOY",
  "TREE_NUTS",
]);

// Define the form schema
const formSchema = z.object({
  picture: z.string(),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  options: z.object({
    alcohol: z.boolean().default(false),
    glutenFree: z.boolean().default(false),
    vegetarian: z.boolean().default(false),
  }),
  allergens: z.object({
    dairy: z.boolean().default(false),
    eggs: z.boolean().default(false),
    fish: z.boolean().default(false),
    gluten: z.boolean().default(false),
    peanuts: z.boolean().default(false),
    soy: z.boolean().default(false),
    treeNuts: z.boolean().default(false),
  }),
});

// Extract the type from the schema
type FormValues = z.infer<typeof formSchema>;

// Extend the Item type to include modifierGroups
type ItemWithModifierGroups = Item & {
  modifierGroups: ModifierGroup[];
};

export function EditItemDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: ItemWithModifierGroups;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>(item.imageUrl || "");
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ModifierGroup[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  // Helper function to transform the allergens form data to array format
  const transformAllergens = (allergensObj: FormValues["allergens"]): AllergenKey[] => {
    const result: AllergenKey[] = [];
    if (allergensObj.dairy) result.push("DAIRY");
    if (allergensObj.eggs) result.push("EGGS");
    if (allergensObj.fish) result.push("FISH");
    if (allergensObj.gluten) result.push("GLUTEN");
    if (allergensObj.peanuts) result.push("PEANUTS");
    if (allergensObj.soy) result.push("SOY");
    if (allergensObj.treeNuts) result.push("TREE_NUTS");
    return result;
  };

  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_223k23JD31j7Pm3EweeP4eFXUgwY",
  });

  // Helper function to parse allergens string safely
  const parseAllergens = (allergensStr: string | null): AllergenKey[] => {
    if (!allergensStr) return [];
    try {
      return JSON.parse(allergensStr);
    } catch (e) {
      console.error("Error parsing allergens:", e);
      return [];
    }
  };

  // Helper function to parse options string safely
  const parseOptions = (optionsStr: string | null) => {
    if (!optionsStr) return { alcohol: false, glutenFree: false, vegetarian: false };
    try {
      const parsed = JSON.parse(optionsStr);
      return {
        alcohol: parsed?.alcohol || false,
        glutenFree: parsed?.glutenFree || false,
        vegetarian: parsed?.vegetarian || false,
      };
    } catch (e) {
      console.error("Error parsing options:", e);
      return { alcohol: false, glutenFree: false, vegetarian: false };
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: item.imageUrl || "",
      displayName: item.displayName || "",
      description: item.description || "",
      price: item.price,
      options: parseOptions(item.options as string | null),
      allergens: {
        dairy: parseAllergens(item.allergens as string | null).includes("DAIRY"),
        eggs: parseAllergens(item.allergens as string | null).includes("EGGS"),
        fish: parseAllergens(item.allergens as string | null).includes("FISH"),
        gluten: parseAllergens(item.allergens as string | null).includes("GLUTEN"),
        peanuts: parseAllergens(item.allergens as string | null).includes("PEANUTS"),
        soy: parseAllergens(item.allergens as string | null).includes("SOY"),
        treeNuts: parseAllergens(item.allergens as string | null).includes("TREE_NUTS"),
      },
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      // Transform the allergens object to array format
      const transformedAllergens = transformAllergens(values.allergens);
      
      await fetch("/api/edit-item", {
        method: "POST",
        body: JSON.stringify({
          data: {
            id: item.id,
            name: values.displayName,
            imageUrl: imageUrl,
            displayName: values.displayName,
            description: values.description,
            price: values.price,
            options: JSON.stringify(values.options),
            allergens: JSON.stringify(transformedAllergens),
            modifierGroups: selectedItems,
          },
        }),
      }).then((res) => res.json());

      onSuccess();
      onOpenChange(false);
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
          const items = await getModifierGroups(user.id);
          setModifierGroups(items);
          console.log("items", items);
        } catch (error) {
          toast({
            title: "Failed to load items",
            variant: "destructive",
          });
        }
      }
    };
    fetchItems();
  }, [user?.id, toast]);

  useEffect(() => {
    setSelectedItems([...item.modifierGroups]);
  }, [item.modifierGroups]);

  // Define the allergen fields for rendering
  const allergenFields = [
    { key: "dairy", label: "Dairy" },
    { key: "eggs", label: "Eggs" },
    { key: "fish", label: "Fish" },
    { key: "gluten", label: "Gluten" },
    { key: "peanuts", label: "Peanuts" },
    { key: "soy", label: "Soy" },
    { key: "treeNuts", label: "Tree Nuts" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-scroll h-fit mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
        <DialogHeader>
          <DialogTitle className="mt-4">Edit Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Image Upload Field */}
            <FormField
              control={form.control}
              name="picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Picture</FormLabel>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Current"
                      className="mb-4 h-32 w-32 object-cover rounded-lg"
                    />
                  )}
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        field.onChange(files ? files[0]?.name || "" : "");
                        if (!files?.[0]) return;

                        try {
                          const { fileUrl } = await uploadManager.upload({
                            data: files[0],
                            mime: files[0].type,
                            originalFileName: files[0].name,
                          });
                          setImageUrl(fileUrl);
                        } catch (error) {
                          form.setError("picture", {
                            message: "Failed to upload image",
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Modifier Groups */}
            <div className="border-slate-200 border-1 border-y py-8 ">
              <h3 className="font-medium mb-2">Modifier Groups</h3>
              <p className="text-gray-400 text-sm mb-2">
                Modifiers allow customers to customize an item. You might have a
                modifier group like "toppings".
              </p>

              <Dialog
                open={selectingItems}
                onOpenChange={() => setSelectingItems((prev) => !prev)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={"default"}
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectingItems((prev) => !prev);
                    }}
                  >
                    Select Modifier Groups <MousePointerClick />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-full h-fit overflow-scroll">
                  <DialogHeader>
                    <DialogTitle>Select Modifier Groups</DialogTitle>
                  </DialogHeader>
                  <div className="">
                    <SelectModifierGroupsTable
                      data={modifierGroups}
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
                      Add Items
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {!selectedItems.length && (
                <div className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <p className="font-light text-sm my-3 mx-5">
                    No modifiers selected yet.
                  </p>
                </div>
              )}
              {selectedItems.map((item) => (
                <div key={item.id} className="outline flex rounded-md h-20 mt-4 outline-slate-200 outline-1 flex-row items-center justify-between">
                  <div className="flex flex-row items-center space-x-4 mx-5">
                    <p className="text-sm leading-none ">{item.name}</p>
                  </div>
                  <div className="flex flex-row items-center space-x-4 mx-5">
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
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Options Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Options</h3>

              {/* Alcohol Switch */}
              <FormField
                control={form.control}
                name="options.alcohol"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Alcohol</FormLabel>
                      <FormDescription>
                        Contains alcoholic ingredients
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Gluten Free Switch */}
              <FormField
                control={form.control}
                name="options.glutenFree"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Gluten Free</FormLabel>
                      <FormDescription>
                        Suitable for gluten-free diets
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Vegetarian Switch */}
              <FormField
                control={form.control}
                name="options.vegetarian"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Vegetarian</FormLabel>
                      <FormDescription>
                        Suitable for vegetarian diets
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Allergens Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Allergens</h3>
              {allergenFields.map(({ key, label }) => (
                <FormField
                  key={key}
                  control={form.control}
                  // This is the key fix for the TypeScript error - using a properly typed key
                  name={`allergens.${key}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="capitalize">
                          {label}
                        </FormLabel>
                        <FormDescription>
                          {`Contains ${label.toLowerCase()}`}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(form.getValues());
                setSelectedItems([]);
                setSelectingItems(false);
                onOpenChange(true);
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
