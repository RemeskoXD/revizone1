'use client';

import { Package, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductsClient({ sharedProducts }: { sharedProducts: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sdílené produkty</h1>
          <p className="text-gray-400 mt-1">Produkty a dokumentace, které s vámi sdílí produktový manažer.</p>
        </div>
      </div>

      {sharedProducts.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Zatím s vámi nejsou sdíleny žádné produkty</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Jakmile vám produktový manažer nasdílí nějaký produkt, objeví se zde i s veškerou dokumentací.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedProducts.map((share, index) => (
            <motion.div 
              key={share.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-brand-yellow/10 text-brand-yellow">
                    <Package className="w-6 h-6" />
                  </div>
                  {share.product.code && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg text-xs font-mono text-gray-400">
                      {share.product.code}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{share.product.name}</h3>
                {share.product.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{share.product.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  Sdílel: {share.product.manager.name}
                </div>
              </div>
              
              <div className="p-4 bg-white/[0.02] flex-1">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Dokumentace ({share.product.documents.length})
                </h4>
                
                {share.product.documents.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Žádné dokumenty</p>
                ) : (
                  <ul className="space-y-2">
                    {share.product.documents.map((doc: any) => (
                      <li key={doc.id}>
                        <a 
                          href={doc.fileUrl} 
                          download={doc.name}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <span className="text-sm text-gray-400 group-hover:text-white transition-colors truncate pr-4">
                            {doc.name}
                          </span>
                          <Download className="w-4 h-4 text-gray-500 group-hover:text-brand-yellow transition-colors flex-shrink-0" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
