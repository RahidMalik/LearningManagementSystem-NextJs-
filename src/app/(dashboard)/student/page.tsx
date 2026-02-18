import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/shared/CourseCard";
import { useState } from "react";

export const StudentDashboard = () => {
  const [isActive, setIsActive] = useState("Graphics Design");
  return (
    <div className="max-w-7xl mx-auto pb-20 px-6 py-2">
      {/* 1. Header Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome, <span className="text-[#0a348f]">Rahid</span>
        </h1>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 cursor-pointer">
        {["Graphics Design", "Wireframing", "UI/UX", "Video Editing"].map(
          (cat) => (
            <Badge
              key={cat}
              variant={isActive === cat ? "default" : "outline"}
              onClick={() => setIsActive(cat)}
              className="px-6 py-2 rounded-xl font-normal"
            >
              {cat}
            </Badge>
          ),
        )}
      </div>

      {/* Continue Watching Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Continue Watching</h2>
        <span className="text-sm text-muted-foreground cursor-pointer hover:underline">
          See All
        </span>
      </div>

      {/* Grid for Courses */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <CourseCard
          id="1"
          title="Graphic Design"
          instructor="Syed Hasnain"
          progress={75}
          image="/Tumbnailimages/GraphicDesign.png"
        />
        <CourseCard
          id="2"
          title="Wireframing"
          instructor="Shoaib Hassan"
          progress={65}
          image="/Tumbnailimages/Wireframing.png"
        />
        <CourseCard
          id="3"
          title="Website Design"
          instructor="Dawar Hanif"
          progress={85}
          image="/Tumbnailimages/Uiux.png"
        />
        <CourseCard
          id="4"
          title="Video Editing"
          instructor="Ammar Ijaz"
          progress={45}
          image="/Tumbnailimages/VideoEditing.png"
        />
      </div>
    </div>
  );
};
