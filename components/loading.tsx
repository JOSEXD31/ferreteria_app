// components/Loader.tsx
export default function Loader({ message = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="flex flex-col items-center text-white space-y-2">
        <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4..." />
        </svg>
        <span className="text-sm text-slate-300">{message}</span>
      </div>
    </div>
  );
}
