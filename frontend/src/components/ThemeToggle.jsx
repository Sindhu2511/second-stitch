import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    /* Changed fixed position to top-right to avoid the top-left corner issue */
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-4 right-8 z-[100] p-3 rounded-full 
        bg-white/20 dark:bg-black/20 backdrop-blur-md 
        border border-amber-200/50 dark:border-white/10
        text-2xl transition-all hover:scale-110 active:scale-95"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}