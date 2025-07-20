import Sidebar from '@/components/Sidebar';

export default function ServiceOrdersLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
