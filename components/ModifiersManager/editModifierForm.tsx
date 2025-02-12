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
import { Item, Modifier } from "@prisma/client";
import { useState } from "react";
import { toast, useToast } from "@/hooks/use-toast";
import * as Bytescale from "@bytescale/sdk";
// Add this component inside your ItemsTable file

const formSchema = z.object({
  imageUrl: z.string(),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number"),
  minSelect: z.coerce.number().int().nonnegative().optional(),
  maxSelect: z.coerce.number().int().nonnegative().optional(),
  isAvailable: z.boolean().default(true),
  availability: z.any().optional(),
});

export function EditModifierDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: {
  item: Modifier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  // ... existing state and upload manager ...
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: item.imageUrl || "",
      displayName: item.displayName || "",
      description: item.description || "",
      price: item.price,
      minSelect: item.minSelect ?? undefined,
      maxSelect: item.maxSelect ?? undefined,
      isAvailable: item.isAvailable ?? true,
      availability: item.availability
        ? JSON.parse(JSON.stringify(item.availability))
        : null,
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await fetch("/api/modifier/edit-modifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            id: item.id,
            name: values.displayName,
            displayName: values.displayName,
            description: values.description,
            price: values.price,
            imageUrl: imageUrl,
            minSelect: values.minSelect,
            maxSelect: values.maxSelect,
            isAvailable: values.isAvailable,
            availability: values.availability,
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

  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_223k23JD31j7Pm3EweeP4eFXUgwY", // This is your API key.
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-5/6 overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-items-start">
        <DialogHeader>
          <DialogTitle className="mt-4">Edit Modifier</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Image Upload Field (keep existing implementation) */}

            <FormField
              control={form.control}
              name="imageUrl"
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
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) {
                            form.setError("imageUrl", {
                              message: "No file selected",
                            });
                            return;
                          }

                          const file = files[0];
                          try {
                            if (!file.type.startsWith("image/")) {
                              throw new Error("Invalid file type");
                            }

                            const { fileUrl, filePath } =
                              await uploadManager.upload({
                                data: file,
                                mime: file.type,
                                originalFileName: file.name,
                              });

                            setImageUrl(fileUrl);
                            console.log(fileUrl);
                          } catch (error) {
                            console.error("Upload error:", error);
                            form.setError("imageUrl", {
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

            {/* Availability Toggle */}
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      Toggle modifier availability
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

            {/* Selection Limits */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Selections</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Selections</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
