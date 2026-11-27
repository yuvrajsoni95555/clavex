"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { navigateWithCurtain } from "./PageTransition";

/** next/link that plays the curtain transition for internal page changes. New-tab clicks and #hash links behave normally. */
export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const samePage = href.split("#")[0] === pathname || href.startsWith("#");
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || samePage) return;
    e.preventDefault();
    navigateWithCurtain(href);
  };

  return <Link href={href} onClick={handle} {...rest} />;
}
