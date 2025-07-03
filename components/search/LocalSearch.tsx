"use client";

import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeyFromQuery } from "@/lib/url";
import { useRouter } from "next/navigation";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: Props) => {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  console.log(searchParams.toString());

  useEffect(() => {
    const deplayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery.toString(),
        });
        router.push(newUrl, {
          scroll: false,
        });
      } else {
        if (pathName == route) {
          const newUrl = removeKeyFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });
          router.push(newUrl);
        }
      }

      return () => clearTimeout(deplayDebounceFn);
    }, 300);
  }, [searchQuery, router, , searchParams]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e?.target?.value);
        }}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
