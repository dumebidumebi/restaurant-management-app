"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TimezoneSelect from "react-timezone-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the schema for validation
const formSchema = z.object({
  general: z.object({
    brandName: z
      .string()
      .min(2, { message: "Brand name must be at least 2 characters." }),
    website: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional(),
    tiktokUrl: z.string().url().optional(),
    cateringUrl: z.string().url().optional(),
    timezone: z.string().min(1, { message: "Timezone is required." }),
    salesTax: z.coerce
      .number()
      .min(0, { message: "Sales tax must be a positive number." }),
  }),
  contact: z.object({
    email: z.string().email({ message: "Invalid email address." }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits." }),
  }),
  fulfillment: z.object({
    prepTime: z
      .number()
      .min(1, { message: "Preparation time must be at least 1 minute." }),
    largeOrderThreshold: z
      .number()
      .min(1, { message: "Large order threshold must be at least 1." }),
    largeOrderPrepTime: z.number().min(1, {
      message: "Large order preparation time must be at least 1 minute.",
    }),
  }),
});

async function getSettings(userId: string) {
  const settings = await fetch("/api/settings", {
    method: "POST",
    body: JSON.stringify({ userId: userId }),
  }).then((res) => res.json());
  return settings;
}

async function updateSettings(userId: string, data: object) {
  const settings = await fetch("/api/update-settings", {
    method: "POST",
    body: JSON.stringify({ userId: userId, data: data }),
  }).then((res) => res.json());
  return settings;
}
export default function SettingsForm() {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState({
    general: {
      brandName: "",
      website: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      cateringUrl: "",
      timezone: "",
      salesTax: 0,
    },
    contact: {
      email: "",
      phone: "",
    },
    fulfillment: {
      prepTime: 15,
      largeOrderThreshold: 10,
      largeOrderPrepTime: 30,
    },
  });
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      general: {
        brandName: "",
        website: "",
        facebookUrl: "",
        instagramUrl: "",
        tiktokUrl: "",
        cateringUrl: "",
        timezone: "",
        salesTax: 0,
      },
      contact: {
        email: "",
        phone: "",
      },
      fulfillment: {
        prepTime: 15,
        largeOrderThreshold: 10,
        largeOrderPrepTime: 30,
      },
    },
    mode: "onChange",
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setShowStickyButtons(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: any) => {
    console.log("Form Data:", data);

    if (!user) return;

    try {
      // Update the settings via the API
      const newSettings = await updateSettings(user?.id, data);

      console.log("Updated Settings:", newSettings);

      // Reset the form with the updated settings
      form.reset({
        general: {
          brandName: newSettings.general.brandName || "",
          website: newSettings.general.website || "",
          facebookUrl: newSettings.general.facebookUrl || "",
          instagramUrl: newSettings.general.instagramUrl || "",
          tiktokUrl: newSettings.general.tiktokUrl || "",
          cateringUrl: newSettings.general.cateringUrl || "",
          timezone: newSettings.general.timezone || "",
          salesTax: newSettings.general.salesTax || 0,
        },
        contact: {
          email: newSettings.contact.email || "",
          phone: newSettings.contact.phone || "",
        },
        fulfillment: {
          prepTime: newSettings.fulfillment.prepTime || 15,
          largeOrderThreshold:
            newSettings.fulfillment.largeOrderThreshold || 10,
          largeOrderPrepTime: newSettings.fulfillment.largeOrderPrepTime || 30,
        },
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setShowStickyButtons(false);
      toast({
        title: "Settings updated successfully!",
      });
    }
  };

  const calculateProgress = () => {
    const filledFields = Object.values(form.getValues()).reduce(
      (acc, value) => {
        if (typeof value === "object") {
          // Calculate the filled fields in nested objects
          return (
            acc + Object.values(value).filter((field) => field !== "").length
          );
        }
        return acc + (value !== "" ? 1 : 0);
      },
      0
    );
    const totalFields = Object.keys(form.getValues()).reduce((acc, key) => {
      if (typeof form.getValues()[key] === "object") {
        // Count nested fields
        return acc + Object.keys(form.getValues()[key]).length;
      }
      return acc + 1;
    }, 0);

    return (filledFields / totalFields) * 100;
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [form.watch()]);

  useEffect(() => {
    // Fetch the existing settings on component mount
    // setIsLoading(true);
    const fetchSettings = async () => {
      try {
        // Replace with your API endpoint
        if (!user) return;

        const data = await getSettings(user?.id);
        setInitialData(data);
        console.log(data);

        // Set the form values with the fetched data
        form.reset({
          general: {
            brandName: data.general.brandName || "",
            website: data.general.website || "",
            facebookUrl: data.general.facebookUrl || "",
            instagramUrl: data.general.instagramUrl || "",
            tiktokUrl: data.general.tiktokUrl || "",
            cateringUrl: data.general.cateringUrl || "",
            timezone: data.general.timezone || "",
            salesTax: data.general.salesTax || 0,
          },
          contact: {
            email: data.contact.email || "",
            phone: data.contact.phone || "",
          },
          fulfillment: {
            prepTime: data.fulfillment.prepTime || 15,
            largeOrderThreshold: data.fulfillment.largeOrderThreshold || 10,
            largeOrderPrepTime: data.fulfillment.largeOrderPrepTime || 30,
          },
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // setIsLoading(true);
    fetchSettings();
  }, [form, user]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setShowStickyButtons(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleCancel = () => {
    form.reset(initialData);
    setShowStickyButtons(false);
  };

  if (isLoading) {
    return (
      <div className="px-20  py-10 space-y-8 ">
        <Progress value={progress} className="w-full mb-0" />
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Business information and online presence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 mt-4">
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/6 mb-4" />
              <Skeleton className="h-11 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return (
      <div className="px-20  py-10 pb-32">
        <Progress value={progress} className="w-full mb-8" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Business information and online presence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="general.brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Brand Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourwebsite.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/yourpage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourprofile"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TikTok URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://tiktok.com/@yourhandle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.cateringUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catering URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourwebsite.com/catering"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <TimezoneSelect
                          value={field.value}
                          onChange={(value) => field.onChange(value?.value)}
                          placeholder="Select Timezone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="general.salesTax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Tax (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Settings</CardTitle>
                <CardDescription>Business contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contact@yourcompany.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Fulfillment Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Settings</CardTitle>
                <CardDescription>
                  Order preparation and handling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="fulfillment.prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Time (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fulfillment.largeOrderThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Large Order Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fulfillment.largeOrderPrepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Large Order Preparation Time (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sticky Buttons */}
            <div
              className={clsx(
                "fixed bottom-0 left-20 right-20 bg-background border-t py-4 transition-transform duration-300",
                showStickyButtons ? "translate-y-0" : "translate-y-full"
              )}
            >
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-red-600 hover:bg-red-400 hover:text-white text-white"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Settings</Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    );
  }
}
