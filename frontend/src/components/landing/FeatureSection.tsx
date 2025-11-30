import { FeatureCard } from "./FeatureCard";

export function FeatureSection() {
  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Sports"
          description="The only way to prove you are a good sport is to lose."
          buttonText="Let's Play"
          colorClass="bg-[#50E3C2]"
        />
        <FeatureCard
          title="Future is Now"
          description="Sufficiently advanced technology is indistinguishable from magic."
          buttonText="Explore"
          colorClass="bg-[#5856D6]"
        />
        <FeatureCard
          title="Food"
          description="How we eat food is as important as what we eat"
          buttonText="Let's Play"
          colorClass="bg-[#FF5E57]"
        />
      </div>
    </section>
  );
}
