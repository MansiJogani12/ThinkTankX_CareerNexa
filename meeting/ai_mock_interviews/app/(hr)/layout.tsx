import Link from "next/link";
import { Building2, LayoutDashboard, Briefcase, Users, GitMerge, LogOut, UserCircle } from "lucide-react";
// import MobileNav from "@/components/MobileNav"; // Uncomment if using MobileNav for HR

const navLinks = [
  { name: "Dashboard", href: "/hr-dashboard", icon: LayoutDashboard },
  { name: "Requisitions", href: "/requisitions", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Cohorts", href: "/cohorts", icon: GitMerge },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  // Authentication should be handled via middleware or the project's custom auth provider.
  // We'll assume the user is authenticated as an HR admin for now.

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-gray-800 border-r border-gray-700/50">
        <div className="p-6 flex items-center space-x-3">
          <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
            PrepWise HR
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-purple-500/30">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-sm flex-1">
              <p className="font-medium text-white">HR Admin</p>
              <p className="text-gray-400 text-xs">Company Portal</p>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="lg:hidden flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700/50 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">PrepWise HR</span>
          </div>
          <div className="flex items-center space-x-4">
             <UserCircle className="w-6 h-6 text-gray-400" />
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
