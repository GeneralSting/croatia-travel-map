import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AUTH_PATHS } from "@/lib/data";

export function RegisterButton() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(AUTH_PATHS.REGISTER);
  };

  return (
    <button
      type="button"
      onClick={handleNavigate}
      className=" cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent h-11 text-sm font-medium text-white transition-colors duration-200 hover:border-white/30"
    >
      <UserPlus className="h-4 w-4 text-white/60" />
      Create an account
    </button>
  );
}
