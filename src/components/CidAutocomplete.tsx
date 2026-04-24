import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CID10_MOCK } from '@/data/mock-data';
import { Search } from 'lucide-react';
import type { CID10 } from '@/types';

interface CidAutocompleteProps {
  value: string;
  onChange: (codigo: string, diagnostico: string) => void;
  id?: string;
}

export function CidAutocomplete({ value, onChange, id }: CidAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CID10[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setHighlightIndex(-1);

    if (val.length > 0) {
      const filtered = CID10_MOCK.filter(
        (cid) =>
          cid.codigo.toLowerCase().includes(val.toLowerCase()) ||
          cid.nome.toLowerCase().includes(val.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
      onChange('', '');
    }
  }

  function handleSelect(cid: CID10) {
    setQuery(`${cid.codigo} - ${cid.nome}`);
    setIsOpen(false);
    onChange(cid.codigo, cid.nome);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Digite o código ou nome do CID-10..."
          className="pl-9"
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg animate-slide-down overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((cid, index) => (
              <li
                key={cid.codigo}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-100 ${
                  index === highlightIndex
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent'
                }`}
                onClick={() => handleSelect(cid)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <span className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold tracking-wider min-w-[60px]">
                  {cid.codigo}
                </span>
                <span className="text-sm">{cid.nome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
