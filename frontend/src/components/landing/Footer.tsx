import Link from "next/link";
import { Command, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-16 px-6 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded-sm">
              <Command size={24} />
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <Link href="#"><Twitter size={20} /></Link>
            <Link href="#"><Instagram size={20} /></Link>
            <Link href="#"><Youtube size={20} /></Link>
            <Link href="#"><Linkedin size={20} /></Link>
          </div>
        </div>

        {/* Use cases */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-[#1A1D28]">Use cases</h4>
          <div className="flex flex-col gap-2 text-sm text-[#586380]">
            <Link href="#">UI design</Link>
            <Link href="#">UX design</Link>
            <Link href="#">Wireframing</Link>
            <Link href="#">Diagramming</Link>
            <Link href="#">Brainstorming</Link>
            <Link href="#">Online whiteboard</Link>
            <Link href="#">Team collaboration</Link>
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-[#1A1D28]">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-[#586380]">
            <Link href="#">Design</Link>
            <Link href="#">Prototyping</Link>
            <Link href="#">Development features</Link>
            <Link href="#">Design systems</Link>
            <Link href="#">Collaboration features</Link>
            <Link href="#">Design process</Link>
            <Link href="#">FigJam</Link>
          </div>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-[#1A1D28]">Resources</h4>
          <div className="flex flex-col gap-2 text-sm text-[#586380]">
            <Link href="#">Blog</Link>
            <Link href="#">Best practices</Link>
            <Link href="#">Colors</Link>
            <Link href="#">Color wheel</Link>
            <Link href="#">Support</Link>
            <Link href="#">Developers</Link>
            <Link href="#">Resource library</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
