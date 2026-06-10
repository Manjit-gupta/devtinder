export default function SkeletonCard() {
  return (
    <div className="card max-w-sm mx-auto animate-pulse">
      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
      <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-6" />
      <div className="flex gap-3 justify-center">
        <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        <div className="h-9 w-24 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
