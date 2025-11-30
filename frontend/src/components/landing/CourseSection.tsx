import { CourseItem } from "./CourseItem";

export function CourseSection() {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <CourseItem
          title="QUEENIE"
          chapter="Chapter 14"
          description="Queenie Jenkins is a 25-year-old Jamaican British woman living in London, straddling two cultures and slotting neatly into neither. She works at a national newspaper..."
          colorClass="bg-[#FF6B35]"
        />
        <CourseItem
          title="RED, WHITE & ROYAL BLUE"
          chapter="Chapter 4"
          description="First Son Alex Claremont-Diaz is the closest thing to a prince this side of the Atlantic. With his intrepid sister and the Veep's genius granddaughter, they..."
          colorClass="bg-[#FF9FF3]"
        />
      </div>
    </section>
  );
}
