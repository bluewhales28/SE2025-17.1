import { CourseItem } from "./CourseItem";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FadeIn } from "@/components/animations/FadeIn";

export function CourseSection() {
    return (
        <SectionWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FadeIn delay={0.2} direction="left">
                    <CourseItem
                        title="QUEENIE"
                        chapter="Chapter 14"
                        description="Queenie Jenkins is a 25-year-old Jamaican British woman living in London, straddling two cultures and slotting neatly into neither. She works at a national newspaper..."
                        colorClass="bg-[#FF6B35]"
                    />
                </FadeIn>
                <FadeIn delay={0.4} direction="right">
                    <CourseItem
                        title="RED, WHITE & ROYAL BLUE"
                        chapter="Chapter 4"
                        description="First Son Alex Claremont-Diaz is the closest thing to a prince this side of the Atlantic. With his intrepid sister and the Veep's genius granddaughter, they..."
                        colorClass="bg-[#FF9FF3]"
                    />
                </FadeIn>
            </div>
        </SectionWrapper>
    );
}
