"use client";
import Link from "next/link";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import useScroll from "@/hooks/use-scroll";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";
import HeaderMobile from "./header-mobile";
import { Button } from "./ui/button";
import logo from "@/images/chikin_logo.png";
import Image from "next/image";

function HeaderWeb() {
  const scrolled = useScroll(8);
  const selectedLayout = useSelectedLayoutSegment();

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 max-w-full mt-0 border-b bg-white border-gray-200 py-8`,
        {
          "border-b border-gray-200 bg-white": scrolled,
          "border-b border-gray-200 bg-white m-0": selectedLayout,
        }
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex flex-row space-x-0 items-center justify-center  position-fixed top-0 left-40 z-50 "
          >
            <Image src={logo} alt="Logo" width={250} height={150} />
          </Link>
        </div>
        {/* <div className="mx-40"></div> */}
        <div>
          <div className="pt-8 flex space-x-5  absolute right-10 mx-5 top-[8px] z-30">
            <div className="hidden sm:block">
              <Link href={"/menu"}>
                <Button variant={"secondary"}>Menu</Button>{" "}
              </Link>
              <Button variant={"secondary"}>Catering</Button>
              <Button variant={"secondary"}>Careers</Button>
            </div>
            <Link href={"/menu"}>
              <Button variant={"default"}>Order Online</Button>
            </Link>
            {/* <SignedIn>
        <UserButton />
        <OrganizationSwitcher createOrganizationUrl="/clerk/create-org"/>
        
        </SignedIn>
        <SignedOut>
        <Link href={"/clerk/sign-up"}>
          <Button className="rounded-sm" size={"sm"}>Sign Up</Button>
        </Link>
      </SignedOut> */}
          </div>
          <div className="flex items-center space-x-4 sm:hidden">
            <HeaderMobile />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderWeb;
