import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            <AlertCircle className="w-16 h-16 text-blue-600 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Page non trouvée
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full md:w-auto">
            <Link href="/" className="inline-flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full md:w-auto">
            <Link href="/signaler">
              Signaler un problème
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
