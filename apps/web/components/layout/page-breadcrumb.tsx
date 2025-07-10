//file:prepaid-gas-website/apps/web/components/layout/page-breadcrumb.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Reusable Page Breadcrumb Component
 */
export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  className = "",
}) => {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className={`flex justify-start items-center ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage className="text-purple-400 font-mono text-sm font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => item.href && handleNavigation(item.href)}
                    className="text-slate-400 hover:text-purple-400 transition-colors cursor-pointer font-mono text-sm"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && (
                <BreadcrumbSeparator className="text-slate-600" />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
