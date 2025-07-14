import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  showText?: boolean;
  size?: number;
}

const StarRating = ({ rating, showText = true, size = 20 }: StarRatingProps) => (
  <div className="flex items-center gap-2 bg-[#FFF9F0] p-2 rounded-lg">
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          fill="hsl(var(--primary-foreground))" 
          className="text-primary-foreground" 
        />
      ))}
    </div>
    {showText && (
      <span className="text-sm font-medium text-[#1E3A8A]">
        {rating}/5
      </span>
    )}
  </div>
);

export default StarRating;