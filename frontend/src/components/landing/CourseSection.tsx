"use client"

import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FadeIn } from "@/components/animations/FadeIn";
import { SubjectCard } from "@/components/common/SubjectCard";

export function CourseSection() {
    const subjects = [
        {
            title: "Thể thao",
            emoji: "⚽",
            color: "bg-green-100",
            description: "Học về các môn thể thao, kỹ thuật và chiến thuật"
        },
        {
            title: "Vũ trụ",
            emoji: "🚀",
            color: "bg-blue-100",
            description: "Khám phá không gian, hành tinh và vũ trụ bao la"
        },
        {
            title: "Ẩm thực",
            emoji: "🍽️",
            color: "bg-red-100",
            description: "Nghệ thuật nấu ăn và văn hóa ẩm thực thế giới"
        },
        {
            title: "Nghệ thuật",
            emoji: "🎨",
            color: "bg-purple-100",
            description: "Hội họa, điêu khắc và các hình thức nghệ thuật"
        },
        {
            title: "Khoa học",
            emoji: "🔬",
            color: "bg-indigo-100",
            description: "Khám phá thế giới khoa học và công nghệ"
        },
        {
            title: "Lịch sử",
            emoji: "📚",
            color: "bg-yellow-100",
            description: "Tìm hiểu quá khứ và các sự kiện lịch sử"
        }
    ];

    return (
        <SectionWrapper>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Học theo chủ đề
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Khám phá các chủ đề học tập đa dạng và thú vị
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                    <FadeIn key={subject.title} delay={0.1 * index}>
                        <SubjectCard
                            title={subject.title}
                            emoji={subject.emoji}
                            color={subject.color}
                            description={subject.description}
                        />
                    </FadeIn>
                ))}
            </div>
        </SectionWrapper>
    );
}
