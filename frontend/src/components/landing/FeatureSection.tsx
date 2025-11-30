import { FeatureCard } from "./FeatureCard";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FadeIn } from "@/components/animations/FadeIn";

export function FeatureSection() {
    return (
        <SectionWrapper>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                <FadeIn delay={0.2} direction="up" className="h-full">
                    <FeatureCard
                        title="Sports"
                        description="The only way to prove you are a good sport is to lose."
                        buttonText="Let's Play"
                        colorClass="bg-[#50E3C2]"
                    />
                </FadeIn>
                <FadeIn delay={0.4} direction="up" className="h-full">
                    <FeatureCard
                        title="Future is Now"
                        description="Sufficiently advanced technology is indistinguishable from magic."
                        buttonText="Explore"
                        colorClass="bg-[#5856D6]"
                    />
                </FadeIn>
                <FadeIn delay={0.6} direction="up" className="h-full">
                    <FeatureCard
                        title="Food"
                        description="How we eat food is as important as what we eat"
                        buttonText="Let's Play"
                        colorClass="bg-[#FF5E57]"
                    />
                </FadeIn>
            </div>
        </SectionWrapper>
    );
}
