import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export default function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= value

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            className="group relative transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:ring-offset-1 rounded"
          >
            <Star
              className={`w-5 h-5 transition-all ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300 group-hover:text-yellow-300'
              }`}
            />
          </button>
        )
      })}
      <span className="ml-1.5 text-xs text-gray-600 font-medium">
        {value} / {max}
      </span>
    </div>
  )
}
