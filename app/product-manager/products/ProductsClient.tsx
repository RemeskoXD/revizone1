'use client';

import { useState } from 'react';
import { Package, Plus, Search, Filter, FileText, Share2, MoreVertical, X, Upload } from 'lucide-react';
import { motion } from 'motion/react';

type Product = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  createdAt: string;
  documents: any[];
  shares: any[];
};

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Chyba při vytváření produktu');
      }

      const newProduct = await res.json();
      setProducts([newProduct, ...products]);
      setIsAddModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Chyba při sdílení produktu');
      }

      const newShare = await res.json();
      
      // Update local state
      setProducts(products.map(p => {
        if (p.id === selectedProduct.id) {
          return { ...p, shares: [...p.shares, newShare] };
        }
        return p;
      }));
      
      setIsShareModalOpen(false);
      setCustomerEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !documentFile) return;
    setIsLoading(true);
    setError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(documentFile);
      
      reader.onload = async () => {
        const fileUrl = reader.result as string;
        
        const res = await fetch(`/api/products/${selectedProduct.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: documentName || documentFile.name, 
            fileUrl,
            fileType: documentFile.type
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Chyba při nahrávání dokumentu');
        }

        const newDoc = await res.json();
        
        // Update local state
        setProducts(products.map(p => {
          if (p.id === selectedProduct.id) {
            return { ...p, documents: [...p.documents, newDoc] };
          }
          return p;
        }));
        
        setIsUploadModalOpen(false);
        setDocumentName('');
        setDocumentFile(null);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error('Chyba při čtení souboru');
      };
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Moje produkty</h1>
          <p className="text-gray-400 mt-1">Správa vašich produktů a jejich dokumentace.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#1A1A1A] text-white border border-white/10 rounded-lg flex items-center gap-2 hover:bg-[#252525] transition-colors">
            <Filter className="w-4 h-4" /> Filtrovat
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Přidat produkt
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat produkt podle názvu nebo kódu..." 
            className="w-full bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Zatím nemáte žádné produkty</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Začněte přidáním prvního produktu. Následně k němu budete moci nahrát dokumentaci a sdílet ho se zákazníky.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Přidat první produkt
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Název produktu</th>
                  <th className="px-6 py-4">Kód</th>
                  <th className="px-6 py-4">Dokumenty</th>
                  <th className="px-6 py-4">Sdíleno s</th>
                  <th className="px-6 py-4 text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product, index) => (
                  <motion.tr 
                    key={product.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-400">{product.code || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{product.documents?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Share2 className="w-4 h-4" />
                        <span>{product.shares?.length || 0} zákazníků</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsUploadModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                          title="Nahrát dokument"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsShareModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                          title="Sdílet se zákazníkem"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Přidat nový produkt</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Název produktu *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Kód produktu (volitelné)</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Popis (volitelné)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none min-h-[100px]"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Ukládám...' : 'Vytvořit produkt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Sdílet produkt</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleShareProduct} className="p-6 space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Sdílíte produkt: <strong className="text-white">{selectedProduct.name}</strong>
              </p>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">E-mail zákazníka *</label>
                <input 
                  type="email" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="zakaznik@email.cz"
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Zákazník musí mít vytvořený účet v aplikaci.
                </p>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsShareModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sdílím...' : 'Sdílet zákazníkovi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Nahrát dokumentaci</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Produkt: <strong className="text-white">{selectedProduct.name}</strong>
              </p>
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Název dokumentu (volitelné)</label>
                <input 
                  type="text" 
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Např. Manuál, Certifikát..."
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Soubor *</label>
                <input 
                  type="file" 
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 text-white focus:border-brand-yellow outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !documentFile}
                  className="flex-1 py-2.5 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Nahrávám...' : 'Nahrát dokument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
