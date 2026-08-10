import { SCREEN_BG } from "../constants/const";

export function MapNotConfigured() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: SCREEN_BG }}
    >
      <div className="max-w-sm space-y-2 text-center">
        <h1 className="text-lg font-semibold text-white">Map not configured</h1>
        <p className="text-sm text-white/60">
          Add your Supabase environment variables to load the map data.
        </p>
      </div>
    </div>
  );
}
