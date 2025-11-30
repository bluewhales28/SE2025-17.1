export function Hero() {
    return (
        <section className="w-full bg-[#E6F0FF] py-20 px-6 flex flex-col items-center justify-center text-center min-h-[400px]">
            <h1 className="text-4xl md:text-6xl font-bold text-[#1A1D28] mb-6 tracking-tight">
                Bạn muốn học như thế nào?
            </h1>
            <p className="text-lg md:text-xl text-[#586380] max-w-3xl leading-relaxed">
                Nắm vững kiến thức đang học với thẻ ghi nhớ
                <br className="hidden md:block" />
                tương tác, bài kiểm tra thử và hoạt động học tập của Quizlet.
            </p>
        </section>
    );
}
