import { BrandButton } from "@/components/common/BrandButton";
import { SectionWrapper } from "@/components/common/SectionWrapper";

export function Hero() {
    return (
        <SectionWrapper background="blue" className="flex flex-col items-center justify-center text-center min-h-[500px]">
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A1D28] mb-6 tracking-tight max-w-4xl">
                Học tập thông minh hơn, <br /> không phải vất vả hơn
            </h1>
            <p className="text-lg md:text-xl text-[#586380] max-w-2xl leading-relaxed mb-10">
                Nắm vững kiến thức với thẻ ghi nhớ tương tác, bài kiểm tra thử và các hoạt động học tập được cá nhân hóa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <BrandButton size="lg" className="px-8 text-lg">
                    Đăng ký miễn phí
                </BrandButton>
                <BrandButton variant="outline" size="lg" className="px-8 text-lg bg-white hover:bg-gray-100 text-[#4255FF] border-[#4255FF]/20">
                    Tìm hiểu thêm
                </BrandButton>
            </div>
        </SectionWrapper>
    );
}
