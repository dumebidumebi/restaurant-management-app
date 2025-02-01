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
import { Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Item } from "@prisma/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as Bytescale from "@bytescale/sdk";
// Add this component inside your ItemsTable file

const allergensEnum = z.enum([
  "DAIRY",
  "EGGS",
  "FISH",
  "GLUTEN",
  "PEANUTS",
  "SOY",
  "TREE_NUTS",
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
export function EditItemDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_223k23JD31j7Pm3EweeP4eFXUgwY",
  });

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: item.imageUrl,
      displayName: item.displayName,
      description: item.description,
      price: item.price,
      options: {
        alcohol: JSON.parse(item.options)?.alcohol || false,
        glutenFree: JSON.parse(item.options)?.glutenFree || false,
        vegetarian: JSON.parse(item.options)?.vegetarian || false,
      },
      allergens: {
        dairy: item.allergens?.includes("DAIRY") || false,
        eggs: item.allergens?.includes("EGGS") || false,
        fish: item.allergens?.includes("FISH") || false,
        gluten: item.allergens?.includes("GLUTEN") || false,
        peanuts: item.allergens?.includes("PEANUTS") || false,
        soy: item.allergens?.includes("SOY") || false,
        treeNuts: item.allergens?.includes("TREE_NUTS") || false,
      },
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
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
            allergens: JSON.stringify(values.allergens),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-5/6 overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
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
                        field.onChange(files || null);
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

            {/* Keep all other form fields from your create form */}
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
              {Object.entries(form.getValues().allergens).map(([allergen]) => (
                <FormField
                  key={allergen}
                  control={form.control}
                  name={`allergens.${allergen}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="capitalize">
                          {allergen.replace(/([A-Z])/g, " $1")}
                        </FormLabel>
                        <FormDescription>
                          {`Contains ${allergen
                            .replace(/([A-Z])/g, " $1")
                            .toLowerCase()}`}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value? true: false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
