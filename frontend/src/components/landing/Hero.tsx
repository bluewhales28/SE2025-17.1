import { BrandButton } from "@/components/common/BrandButton";
import { SectionWrapper } from "@/components/common/SectionWrapper";
import { FadeIn } from "@/components/animations/FadeIn";

export function Hero() {
    return (
        <SectionWrapper background="blue" className="flex flex-col items-center justify-center text-center min-h-[600px] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <FadeIn delay={0.1} direction="up">
                <h1 className="text-5xl md:text-7xl font-extrabold text-[#1A1D28] mb-8 tracking-tight max-w-5xl leading-[1.1]">
                    Học tập <span className="text-[#4255FF]">thông minh hơn</span>, <br /> không phải vất vả hơn
                </h1>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
                <p className="text-xl md:text-2xl text-[#586380] max-w-3xl leading-relaxed mb-12 font-medium">
                    Nắm vững kiến thức với thẻ ghi nhớ tương tác, bài kiểm tra thử và các hoạt động học tập được cá nhân hóa.
                </p>
            </FadeIn>

            <FadeIn delay={0.5} direction="up">
                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                    <BrandButton size="lg" className="px-10 py-7 text-xl shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
                        Đăng ký miễn phí
                    </BrandButton>
                    <BrandButton variant="outline" size="lg" className="px-10 py-7 text-xl bg-white hover:bg-gray-50 text-[#4255FF] border-[#4255FF]/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        Tìm hiểu thêm
                    </BrandButton>
                </div>
            </FadeIn>
        </SectionWrapper>
    );
}
