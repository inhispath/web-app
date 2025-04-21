"use client";

import Image from "next/image";
import { ArrowRight, CircleCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden text-[var(--primary-black)] font-primary">
      {/* Hero Section: Header + Split Section (Combined 100vh) */}
      <section className="w-full h-screen flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center font-primary justify-between whitespace-nowrap bg-transparent py-[15px] px-[40px]">
          <div className="flex items-center">
            <Image
              onClick={() => (window.location.href = "/")}
              src="/black_logo.png"
              alt="Logo"
              width={24}
              height={0}
              style={{ height: "auto" }}
              className="pr-[12px] cursor-pointer"
            />
            <p
              onClick={() => (window.location.href = "/")}
              className="text-[var(--primary-black)] cursor-pointer font-[800] text-[18px] mr-[40px]"
            >
              IN HIS PATH
            </p>

            <div className="text-[var(--primary-black)] flex flex-row gap-[24px] cursor-pointer">
              {/* <p>Explore</p>
              <p>Plans</p>
              <p>Community</p>
              <p>Resources</p>
              <p>About</p> */}
              <p onClick={() => { window.location.href = "/read" }}>Read</p>
              <p onClick={() => { window.location.href = "/prayers" }}>Prayers</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 w-full bg-[var(--foreground)]">
          <div id="first_div" className="w-1/2 flex flex-col justify-center pl-[80px] pr-[40px]">
            <h1 id="embrace_title" className="text-[4.5rem] font-[400] mb-[16px]">
              Embrace the teachings of Jesus Christ
            </h1>
            <p id="desc_title" className="text-[1.2rem] text-[var(--primary-gray)] mb-4 w-[70%]">
              Discover a journey grounded in purpose, faith, and community. Join us and start walking in his path today.
            </p>

            <div className="flex flex-row gap-[16px] mt-[32px]">
              <button
                className="px-[24px] py-[12px] text-[15px] rounded-full border-none bg-[#684242] hover:bg-[var(--border)] font-primary w-fit transition-all duration-200"
                onClick={() => (window.location.href = "/read")}
              >
                Start Reading
              </button>

              <button
                className="px-[24px] py-[12px] text-[15px] text-[#684242] rounded-full border border-[2px] border-[#684242] bg-transparent hover:bg-[var(--border)] font-primary w-fit transition-all duration-200"
                onClick={() => window.open("https://discord.gg/inhispath", "_blank")}
              >
                Join Community
              </button>
            </div>
          </div>

          <div id="second_div" className="w-1/2 relative">
            <Image
              src="https://hips.hearstapps.com/hmg-prod/images/easter-bible-verses-1676924835.jpg?crop=0.668xw:1.00xh;0,0&resize=1200:*"
              alt="Hero Image"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Content below the hero section */}
      <section className="w-full py-[50px] text-center">
        <div className="max-w-5xl mx-auto px-[12px]">
          <h2 className="text-4xl font-[200] text-[2.5rem] mb-[8px]">Nurture Your Faith Journey</h2>
          <h4 className="text-4xl font-[400] text-[var(--primary-gray)] max-w-[700px] mx-auto mb-[84px]">
            Our mission is to guide individuals on their spiritual path, providing resources and a supportive community to help them deepen their understanding of Christian faith.
          </h4>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] max-w-[1500px] mx-auto gap-[36px] p-[24px]">
            {/* Div 1 */}
            <div className="flex flex-col gap-3 pb-3 max-w-[400px] mx-auto">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-[6px]"
                style={{
                  backgroundImage:
                    'url("https://cdn.usegalileo.ai/sdxl10/9a2d0103-6243-4fe2-a559-566d9b20a1d8.png")',
                }}
              ></div>
              <div className="text-left mt-[18px]">
                <p className="text-[#111418] text-base font-medium leading-normal mb-[3px]">Daily Devotionals</p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Start your day with inspiring devotionals to strengthen your faith.
                </p>
              </div>
            </div>

            {/* Div 2 */}
            <div className="flex flex-col gap-3 pb-3 max-w-[400px] mx-auto">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-[6px]"
                style={{
                  backgroundImage:
                    'url("https://cdn.usegalileo.ai/sdxl10/a10cc5e2-e022-4359-aa52-498e517b22ce.png")',
                }}
              ></div>
              <div className="text-left mt-[18px]">
                <p className="text-[#111418] text-base font-medium leading-normal mb-[3px]">Community Support</p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Connect with a supportive community to share your journey.
                </p>
              </div>
            </div>

            {/* Div 3 */}
            <div className="flex flex-col gap-3 pb-3 max-w-[400px] mx-auto">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-[6px]"
                style={{
                  backgroundImage:
                    'url("https://cdn.usegalileo.ai/sdxl10/eb8d7fb1-e061-468a-9a07-f788f0cf8378.png")',
                }}
              ></div>
              <div className="text-left mt-[18px]">
                <p className="text-[#111418] text-base font-medium leading-normal mb-[3px]">Reading Library</p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Access the most feature-rich Bible reading website with over 140 translations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--foreground)] py-[50px] text-center">
        <p className="text-[#684242] font-[500]">TODAY'S SCRIPTURE</p>
        <h2 className="font-[200] italic py-[30px] mx-auto px-[16px] max-w-[1200px]">"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."</h2>
        <p className="font-[600] text-[var(--primary-gray)] italic">Jeremiah 29:11</p>
        <button
          className="px-[24px] py-[12px] flex items-center mx-auto gap-[6px] mt-[40px] text-[15px] text-[#684242] rounded-full border border-[2px] border-[#684242] bg-transparent hover:bg-[var(--border)] font-primary w-fit transition-all duration-200"
          onClick={() => window.location.href = '/verse/24/29/11'}
        >
          Read in Context
          <ArrowRight size={18} />
        </button>
      </section>

      <section id="section_features" className="w-full bg-transparent p-[50px] flex">
        <div id="section_one" className="w-1/2">
          <img
            src="https://store.christianitytoday.com/cdn/shop/articles/Untitled_design_3.jpg?v=1717169999"
            alt="Description of image"
            className="w-full h-auto object-cover rounded-[12px]"
          />
        </div>

        <div id="section_two" className="w-1/2 flex flex-col justify-center items-start px-[50px]">
          <h2 className="text-[2em] font-[400] text-[#111418]">Read and Learn from the Bible</h2>
          <p className="text-[#637588] text-sm mt-[12px] w-[80%]">
            Our website's reading section was built with the idea of learning from the Bible and incorporating these ideas into your life.
            We've taken advice and ideas from the community and built them making it the suitable for your needs. Some features:
          </p>

          <ul className="mt-[30px] gap-[8px] grid">
            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> Contains 140+ translations
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> Read chapters are saved
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> Save verses to notes
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> Search feature (for books, chapters and verses)
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> 3 different reading layouts, choose what works best for you
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> Compare verses from different translations easily
            </p>

            <p className="flex items-center">
              <CircleCheck className="mr-[8px]" size={18} /> And more!
            </p>
          </ul>
        </div>
      </section>

      <section className="w-full py-[50px] text-center bg-[#684242] text-[#fff]">
        <div className="max-w-5xl mx-auto px-[12px]">
          <h2 className="text-4xl font-[200] text-[2.5rem] mb-[8px]">Begin your Journey Today</h2>
          <h4 className="text-4xl font-[400] text-[#d0d0d0] max-w-[700px] mx-auto mb-[54px]">
            We have only just started our mission, and we are nowhere near finished. If you would like to support us, please consider joining our community.
          </h4>

          <div className="flex flex-row justify-center items-center gap-[16px]">
            <button
              className="px-[24px] py-[12px] text-[15px] rounded-full border-none text-[#684242] bg-[var(--foreground)] hover:bg-[var(--border)] font-primary w-fit transition-all duration-200"
              onClick={() => (window.location.href = "/read")}
            >
              Start Reading
            </button>

            <button
              className="px-[24px] py-[12px] text-[15px] text-[var(--foreground)] rounded-full border border-[2px] border-[var(--foreground)] bg-transparent hover:bg-[var(--border)] font-primary w-fit transition-all duration-200"
              onClick={() => window.open("https://discord.gg/inhispath", "_blank")}
            >
              Join Community
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
