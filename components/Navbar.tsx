import Link from "next/link";

const Navbar = () => {
  return (
    // هذا هو الحاوي الرئيسي للشريط
    <nav className="fixed w-full z-50 flex justify-between items-center px-8 py-4 bg-black/80 backdrop-blur-md">
      
      {/* 1. اللوجو على اليسار */}
      <div className="text-2xl font-bold text-red-600 cursor-pointer">
        <Link href="/">NETFLIX<span className="text-white text-sm">Clone</span></Link>
      </div>

      {/* 2. الروابط في المنتصف */}
      <ul className="flex gap-6 text-gray-300 font-medium">
        <li className="hover:text-white transition-colors">
          <Link href="/">الرئيسية</Link>
        </li>
        <li className="hover:text-white transition-colors">
          <Link href="/movies">أفلام</Link>
        </li>
        <li className="hover:text-white transition-colors">
          <Link href="/series">مسلسلات</Link>
        </li>
        <li className="hover:text-white transition-colors">
          <Link href="/new">الأحدث</Link>
        </li>
      </ul>

      {/* 3. أزرار البحث والحساب على اليمين */}
      <div className="flex items-center gap-4">
        <button className="text-white">🔍</button>
        <div className="w-8 h-8 bg-red-600 rounded cursor-pointer"></div> {/* صورة بروفايل وهمية */}
      </div>
      
    </nav>
  );
};

export default Navbar;