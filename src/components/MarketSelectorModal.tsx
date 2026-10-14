import React, { useState, useMemo } from 'react';
import { Search, Star, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Asset, AssetCategory } from '../types';
import { ASSETS_DATA } from '../marketData';

interface MarketSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
}

export const MarketSelectorModal: React.FC<MarketSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  onSelectAsset,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'favorites'>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['ripple-otc', 'cosmos-otc', 'gold-otc', 'eur-cad-otc']);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredAssets = useMemo(() => {
    return ASSETS_DATA.filter((asset) => {
      // Category filter
      if (activeCategory === 'favorites') {
        if (!favorites.includes(asset.id)) return false;
      } else {
        if (asset.category !== activeCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          asset.name.toLowerCase().includes(query) ||
          asset.symbol.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activeCategory, searchQuery, favorites]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in select-none">
      <div className="bg-[#181c27] border border-[#273042] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#232938] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white tracking-wide">
              Select trade pair
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222a3b] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#232938]">
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-bold transition-colors border-b-2 ${
              activeCategory === 'favorites'
                ? 'border-[#0070f3] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setActiveCategory('currencies')}
            className={`pb-2.5 px-2 text-xs font-bold uppercase transition-colors border-b-2 ${
              activeCategory === 'currencies'
                ? 'border-[#0070f3] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Currencies
          </button>

          <button
            onClick={() => setActiveCategory('crypto')}
            className={`pb-2.5 px-2 text-xs font-bold uppercase transition-colors border-b-2 ${
              activeCategory === 'crypto'
                ? 'border-[#0070f3] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Crypto
          </button>

          <button
            onClick={() => setActiveCategory('commodities')}
            className={`pb-2.5 px-2 text-xs font-bold uppercase transition-colors border-b-2 ${
              activeCategory === 'commodities'
                ? 'border-[#0070f3] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Commodities
          </button>

          <button
            onClick={() => setActiveCategory('stocks')}
            className={`pb-2.5 px-2 text-xs font-bold uppercase transition-colors border-b-2 ${
              activeCategory === 'stocks'
                ? 'border-[#0070f3] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Stocks
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-[#232938]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search trade pair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121620] border border-[#232a3a] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0070f3] transition-colors"
            />
          </div>
        </div>

        {/* Table column headers */}
        <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#141822] border-b border-[#232938]">
          <div className="col-span-1 text-center">★</div>
          <div className="col-span-5">Name</div>
          <div className="col-span-2 text-right">24h Changing</div>
          <div className="col-span-2 text-right">Profit 1+ min</div>
          <div className="col-span-2 text-right">5+ min</div>
        </div>

        {/* Assets List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#202636]">
          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No trade pairs found for this filter.
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isFav = favorites.includes(asset.id);
              const isSelected = selectedAsset.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  className={`grid grid-cols-12 px-4 py-3 items-center text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1e273a] text-white font-semibold'
                      : 'hover:bg-[#1a2130] text-slate-200'
                  }`}
                >
                  {/* Favorite star */}
                  <div
                    className="col-span-1 flex justify-center text-slate-500 hover:text-amber-400"
                    onClick={(e) => toggleFavorite(e, asset.id)}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFav
                          ? 'fill-amber-400 text-amber-400'
                          : 'hover:fill-slate-400'
                      }`}
                    />
                  </div>

                  {/* Asset Name */}
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {asset.name}
                    </span>
                  </div>

                  {/* 24h Change */}
                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                        asset.change24h >= 0
                          ? 'bg-[#00b074]/15 text-[#00b074]'
                          : 'bg-[#ff4757]/15 text-[#ff4757]'
                      }`}
                    >
                      {asset.change24h >= 0 ? '+' : ''}
                      {asset.change24h}%
                    </span>
                  </div>

                  {/* Profit 1+ min */}
                  <div className="col-span-2 text-right">
                    <span className="font-extrabold text-[#00b074] text-xs tabular-nums">
                      {asset.payout1m}%
                    </span>
                  </div>

                  {/* Profit 5+ min */}
                  <div className="col-span-2 text-right">
                    <span className="font-semibold text-amber-400 text-xs tabular-nums">
                      {asset.payout5m}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
