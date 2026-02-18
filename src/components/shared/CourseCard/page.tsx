import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CourseProps {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
}

export const CourseCard = ({
  id,
  title,
  instructor,
  progress,
  image,
}: CourseProps) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/course/${id}`)}
      className="group relative overflow-hidden border-none shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer bg-white"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="bg-white text-[#0a348f] px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2">
            <Eye size={16} /> View Details
          </div>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          <div className="flex text-blue-600 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill="currentColor" />
            ))}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">By {instructor}</p>

        <div className="space-y-1 mt-2">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>{progress}% Done</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
