export default function Screen({ active, children }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center bg-mova-bg dark:bg-mova-bg-dark transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${active ? 'opacity-100 visible translate-y-0 z-20 pointer-events-auto' : 'opacity-0 invisible translate-y-5 z-10'}`}
    >
      {children}
    </div>
  );
}
