"use client";

import { Search } from "lucide-react";

export function RetroSearchTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("keyboard:openSearch"));
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-full cursor-pointer rounded-full border-2 border-black
        bg-white py-2 pr-4 pl-10 text-left text-sm text-gray-500
        shadow-[2px_2px_0px_0px_#000] transition-all
        hover:translate-x-[1px] hover:translate-y-[1px]
        hover:shadow-[1px_1px_0px_0px_#000]
        focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none
      `}
    >
      <Search className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-gray-500" />
      Search
    </button>
  );
}
