import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const readSiteDomain = async (domain: string) => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const { data, error } = await supabase
      .from("Store")
      .select(
        `
        id,
      site_subdomain
    `
      )
      .eq("site_subdomain", domain);

    if (error?.code) return error;

    return data?.[0];
  } catch (error: any) {
    return error;
  }
};
