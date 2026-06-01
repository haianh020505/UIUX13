import { Star } from 'lucide-react';

export default function ReviewText({ text }: { text: string }) {
  return (
    <span>
      <span className="mb-1 flex text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={15} fill="currentColor" />
        ))}
      </span>
      <span className="text-slate-600">"{text}"</span>
    </span>
  );
}
