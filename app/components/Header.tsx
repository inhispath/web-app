"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center font-primary justify-between whitespace-nowrap bg-[#fff] border-b border-b-[#ff0000] py-[15px] px-[40px]">
      <div className="flex items-center">
        <Image onClick={() => (window.location.href = "/")} src="/black_logo.png" alt="Logo" width={24} height={0} style={{ height: "auto" }} className="pr-[12px] cursor-pointer" />
        <p onClick={() => (window.location.href = "/")} className="text-[var(--primary-black)] cursor-pointer font-[800] text-[18px] mr-[40px]">IN HIS PATH</p>

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
  );
}
