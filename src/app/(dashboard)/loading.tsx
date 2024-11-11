
export default function BounceLoader() {
    return (
      <div className="flex items-center justify-center h-screen w-screen space-x-2">
        <div className="h-5 w-5 animate-bounce rounded-full bg-zinc-950 dark:bg-gray-50 [animation-delay:-0.3s]"></div>
        <div className="h-5 w-5 animate-bounce rounded-full bg-zinc-950 dark:bg-gray-50 [animation-delay:-0.13s]"></div>
        <div className="h-5 w-5 animate-bounce rounded-full bg-zinc-950 dark:bg-gray-50"></div>
      </div>
    )
  }