function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>BookMellow 🌸 ออกแบบด้วยความรักเพื่อคนรักหนังสือทุกท่าน ขอให้ทุกวันของคุณเป็นวันที่สดใสนะคะ</p>
        <p className="text-xs">
          {' '}© 2026 BookMellow Web Application. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;