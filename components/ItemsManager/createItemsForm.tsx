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
import { ModifierGroup } from "@prisma/client";
import { getModifierGroups } from "../ModifierGroupsManager/modifierGroupsManager";
import { toast } from "@/hooks/use-toast";

const allergensEnum = z.enum([
  "DAIRY",
  "EGGS",
  "FISH",
  "GLUTEN",
  "PEANUTS",
  "SOY",
  "TREENUTS",
]);

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
  allergens: z
    .object({
      dairy: z.boolean().default(false),
      eggs: z.boolean().default(false),
      fish: z.boolean().default(false),
      gluten: z.boolean().default(false),
      peanuts: z.boolean().default(false),
      soy: z.boolean().default(false),
      treeNuts: z.boolean().default(false),
    })
    .transform((obj) =>
      Object.entries(obj)
        .filter(([_, value]) => value)
        .map(
          ([key]) =>
            allergensEnum.enum[
              key.toUpperCase() as keyof typeof allergensEnum.enum
            ]
        )
    ),
});

async function createItem(userId: string, data: object) {
  const settings = await fetch("/api/create-item", {
    method: "POST",
    body: JSON.stringify({ userId: userId, data: data }),
  }).then((res) => res.json());
  return settings;
}

export function ItemsForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState("");
  const [selectingItems, setSelectingItems] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ModifierGroup[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      displayName: "",
      description: "",
      price: 0,
      options: {
        alcohol: false,
        glutenFree: false,
        vegetarian: false,
      },
      allergens: {
        // ✅ Ensure it matches the pre-transformed schema
        dairy: false,
        eggs: false,
        fish: false,
        gluten: false,
        peanuts: false,
        soy: false,
        treeNuts: false,
      }, // ✅ Use an array instead of an object
    },
  });

  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_223k23JD31j7Pm3EweeP4eFXUgwY", // This is your API key.
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form:", values);
    try {
      if (!user) return;

      await createItem(user.id, {
        ...values,
        imageUrl: imageUrl,
        allergens: values.allergens,
        modifierGroups: modifierGroups,
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
          const items = await getModifierGroups(user.id);
          setModifierGroups(items);
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
          Create Item
        </Button>
      </DialogTrigger>
      <DialogContent className="h-5/6 overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
        <DialogHeader>
          <DialogTitle className="mt-4">Create New Item</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
          //  onSubmit={form.handleSubmit(onSubmit)} 
           className="space-y-8">
            {/* Picture Upload */}

            <FormField
              control={form.control}
              name="picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Picture</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const files = e.target.files;
                          //   field.onChange(files || null); // Handle null case

                          if (!files || files.length === 0) {
                            // Handle empty file selection
                            form.setError("picture", {
                              message: "No file selected",
                            });
                            return;
                          }

                          const file = files[0];

                          try {
                            // Optional: Validate file type
                            if (!file.type.startsWith("image/")) {
                              throw new Error("Invalid file type");
                            }

                            const { fileUrl, filePath } =
                              await uploadManager.upload({
                                data: file,
                                mime: file.type,
                                originalFileName: file.name,
                              });

                            // Update form state or show success
                            setImageUrl(fileUrl);
                            console.log(fileUrl);

                            // If you want to store the URL in your form:
                            // form.setValue("pictureUrl", fileUrl);
                          } catch (error) {
                            console.error("Upload error:", error);
                            form.setError("picture", {
                              message:
                                error instanceof Error
                                  ? error.message
                                  : "File upload failed",
                            });
                          }
                        }}
                      />
                    </div>
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
                <DialogTrigger>
                  <Button
                    variant={"default"}
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectingItems((prev) => !prev)
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
              {Object.keys(form.getValues().allergens).map((allergen) => (
                <FormField
                  key={allergen}
                  control={form.control}
                  name={`allergens.${allergen}`} // ✅ Use correct path
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="capitalize">{allergen}</FormLabel>
                        <FormDescription>
                          {`Contains ${allergen}`}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value ? true : false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full"
             onClick={(e)=>{
               e.preventDefault();
               onSubmit(form.getValues())
               setSelectedItems([])
               setSelectingItems(false)
               setIsDialogOpen(false)
             }}>
              Create Item
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
