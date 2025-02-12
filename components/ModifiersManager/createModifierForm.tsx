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

const formSchema = z.object({
  picture: z.string(),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
});

async function createModifier(userId: string, data: object) {
  const settings = await fetch("/api/modifier/create-modifier", {
    method: "POST",
    body: JSON.stringify({ userId: userId, data: data }),
  }).then((res) => res.json());
  return settings;
}

export function CreateModifierForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: "",
      displayName: "",
      description: "",
      price: 0,
    },
  });

  const uploadManager = new Bytescale.UploadManager({
    apiKey: "public_223k23JD31j7Pm3EweeP4eFXUgwY", // This is your API key.
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form:", values);
    try {
      if (!user) return;

      await createModifier(user.id, {
        ...values,
        imageUrl: imageUrl,
      });

      onSubmitSuccess();
      // Reset form to default values
      form.reset();

      // Refresh items list after successful creation
      setImageUrl("");
      setIsDialogOpen(false);
    } catch (error) {}
  }

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
          Create Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-5/6 overflow-scroll mb-20 rounded-md flex flex-col space-y-5 justify-between">
        <DialogHeader>
          <DialogTitle className="mt-4">Create New Modifier</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          if (!files || files.length === 0) {
                            form.setError("picture", {
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

            <Button type="submit" className="w-full">
              Create Modifier
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}