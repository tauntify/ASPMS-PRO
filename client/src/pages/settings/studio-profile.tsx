import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { OrganizationSettings } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  studioName: z.string().min(1, "Studio name is required"),
  tagline: z.string().optional(),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
  defaultCurrency: z.string().default("PKR"),
  defaultAreaUnit: z.enum(["sqm", "sqft", "kanal", "yard"]).default("sqm"),
  timezone: z.string().default("Asia/Karachi"),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudioProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const orgId = user?.organizationId || "arka_office";

  const { data: settings, isLoading } = useQuery<OrganizationSettings>({
    queryKey: [`/api/orgs/${orgId}/settings`],
    queryFn: async () => {
      const response = await apiFetch(`/api/orgs/${orgId}/settings`);
      if (!response.ok) {
        // Return default values if not found
        return {
          id: "",
          orgId,
          studioName: "My Studio",
          contactEmail: user?.email || "",
          defaultCurrency: "PKR",
          defaultAreaUnit: "sqm" as const,
          timezone: "Asia/Karachi",
          theme: "default" as const,
          languages: ["en" as const],
          blogEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return response.json();
    },
    enabled: !!user,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: settings
      ? {
          studioName: settings.studioName,
          tagline: settings.tagline || "",
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone || "",
          defaultCurrency: settings.defaultCurrency,
          defaultAreaUnit: settings.defaultAreaUnit,
          timezone: settings.timezone,
          workingHoursStart: settings.workingHours?.start || "",
          workingHoursEnd: settings.workingHours?.end || "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        studioName: data.studioName,
        tagline: data.tagline,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        defaultCurrency: data.defaultCurrency,
        defaultAreaUnit: data.defaultAreaUnit,
        timezone: data.timezone,
        workingHours: data.workingHoursStart && data.workingHoursEnd
          ? {
              start: data.workingHoursStart,
              end: data.workingHoursEnd,
            }
          : undefined,
      };

      const response = await apiFetch(`/api/orgs/${orgId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orgs/${orgId}/settings`] });
      toast({
        title: t("success.saved"),
        description: "Studio profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.studioProfile")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your studio's basic information and branding
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("settings.logo")}
            </label>
            <div className="flex items-center gap-4">
              {settings?.logoURL && (
                <img
                  src={settings.logoURL}
                  alt="Studio Logo"
                  className="h-20 w-20 rounded-lg object-cover border"
                />
              )}
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended size: 200x200px. Max file size: 2MB
            </p>
          </div>

          <FormField
            control={form.control}
            name="studioName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.studioName")}</FormLabel>
                <FormControl>
                  <Input placeholder="Ofivio Studio" {...field} />
                </FormControl>
                <FormDescription>
                  This name will appear in the header and on invoices
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("settings.tagline")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Architecture & Design Excellence"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A short tagline or slogan for your studio
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contactEmail")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="hello@studio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.contactPhone")}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+92 300 1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.defaultCurrency")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PKR">PKR (₨)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultAreaUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.defaultAreaUnit")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sqm">Square Meters (sqm)</SelectItem>
                      <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                      <SelectItem value="kanal">Kanal</SelectItem>
                      <SelectItem value="yard">Square Yard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.timezone")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="workingHoursStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Hours - Start</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingHoursEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Hours - End</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {t("settings.discardChanges")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("settings.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
