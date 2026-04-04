export default function SiteFooter() {
  return (
    <footer className="border-t border-[#111]/10 bg-[#f9f9f7]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 text-center sm:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-lg font-light text-[#111]">Creativity</h3>
            <p className="text-sm font-light text-[#111]/70">Fostering imagination and innovation</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-light text-[#111]">Individuality</h3>
            <p className="text-sm font-light text-[#111]/70">Celebrating those who think different</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-light text-[#111]">Curiosity</h3>
            <p className="text-sm font-light text-[#111]/70">Questioning assumptions, exploring ideas</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
