export default function CourseTable() {
  const courses = [
    {
      id: 1,
      name: "Graphic Design Masterclass",
      students: 450,
      price: "$72",
      status: "Active",
    },
    {
      id: 2,
      name: "Full Stack Development",
      students: 320,
      price: "$150",
      status: "Active",
    },
    {
      id: 3,
      name: "UI/UX Bootcamp",
      students: 180,
      price: "$89",
      status: "Draft",
    },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold text-xl">Recent Courses</h3>
        <button className="text-[#0a348f] font-bold text-sm hover:underline">
          View All
        </button>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black">
          <tr>
            <th className="px-6 py-4 text-left">Course Name</th>
            <th className="px-6 py-4 text-left">Students</th>
            <th className="px-6 py-4 text-left">Price</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {courses.map((course) => (
            <tr
              key={course.id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 font-bold text-slate-800">
                {course.name}
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium">
                {course.students}
              </td>
              <td className="px-6 py-4 text-slate-600 font-medium">
                {course.price}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    course.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {course.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
