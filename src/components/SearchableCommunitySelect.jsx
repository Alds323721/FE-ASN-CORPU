import { useState, useRef, useEffect, useId } from 'react';
import { Search, ChevronDown, Check, X, Building2 } from 'lucide-react';

const SearchableCommunitySelect = ({
  komunitasList = [],
  value = '',
  onChange,
  placeholder = 'Pilih Komunitas...',
  required = false,
  disabled = false,
  error = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownId = useId();

  const items = Array.isArray(komunitasList) ? komunitasList : [];

  const selectedItem = items.find(
    (k) => String(k.komunitas_id) === String(value)
  );

  const filteredItems = items.filter((k) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nama = (k.nama_komunitas || '').toLowerCase();
    const rumpun = (k.rumpun_jabatan || '').toLowerCase();
    return nama.includes(term) || rumpun.includes(term);
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    if (onChange) {
      onChange(item.komunitas_id);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const getRumpunLabel = (item) => {
    if (item.rumpun_jabatan === 'UMUM' || item.is_umum) {
      return 'Umum / Semua Rumpun';
    }
    if (item.rumpun_jabatan) {
      return `Rumpun ${item.rumpun_jabatan}`;
    }
    return null;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        id={dropdownId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between text-left transition-colors cursor-pointer bg-white ${
          error
            ? 'border-red-400 bg-red-50/20 focus:ring-red-500'
            : isOpen
            ? 'border-teal-600 ring-2 ring-teal-500/20'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
      >
        <span className="truncate flex items-center gap-1.5 pr-2">
          {selectedItem ? (
            <>
              <span className="font-semibold text-gray-800 truncate">
                {selectedItem.nama_komunitas}
              </span>
              {getRumpunLabel(selectedItem) && (
                <span className="text-[11px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 shrink-0">
                  {getRumpunLabel(selectedItem)}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-700' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama komunitas atau rumpun..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-gray-800 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Hapus pencarian"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-gray-500">
              <span>Menampilkan {filteredItems.length} dari {items.length} komunitas</span>
              {searchTerm && (
                <span className="text-teal-700 font-medium">Filter aktif</span>
              )}
            </div>
          </div>

          <div
            role="listbox"
            aria-labelledby={dropdownId}
            className="max-h-48 overflow-y-auto divide-y divide-gray-50 p-1"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((k) => {
                const isSelected = String(k.komunitas_id) === String(value);
                const rumpunLabel = getRumpunLabel(k);

                return (
                  <button
                    key={k.komunitas_id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(k)}
                    className={`w-full px-2.5 py-2 text-left rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col pr-2 min-w-0">
                      <span className="truncate">{k.nama_komunitas}</span>
                      {rumpunLabel && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          {rumpunLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5 text-teal-700 shrink-0 ml-1"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-gray-500">
                <Building2 className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                <p className="font-medium text-gray-700 text-xs">Komunitas tidak ditemukan</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Tidak ada kecocokan untuk &quot;{searchTerm}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableCommunitySelect;
