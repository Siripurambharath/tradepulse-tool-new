import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { Checkbox } from '@/components/ui/checkbox';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react';

import EmailModal from '@/components/EmailModal';

const API = 'http://localhost:5000';

interface Shipment {
  id: number;
  exporter_name: string;
  country_of_discharge: string;
  product_description: string;
  hsncode: string;
  mode_shipment: string;
  total_fob_value: string;
  fob_value_currency: string;
  email?: string;
}

interface FilterOption {
  country_of_discharge?: string;
  mode_shipment?: string;
  year?: number;
}

export default function SearchPage() {
  /*
  =====================================
  STATE MANAGEMENT
  =====================================
  */

  const [rows, setRows] = useState<Shipment[]>([]);

  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');

  const [countryFilter, setCountryFilter] = useState('all');

  const [modeFilter, setModeFilter] = useState('all');

  const [yearFilter, setYearFilter] = useState('all');

  const [countries, setCountries] = useState<FilterOption[]>([]);

  const [modes, setModes] = useState<FilterOption[]>([]);

  const [years, setYears] = useState<FilterOption[]>([]);

  const [page, setPage] = useState(0);

  const [totalCount, setTotalCount] = useState(0);

  const [selected, setSelected] = useState<Set<number>>(
    new Set()
  );

  const [emailOpen, setEmailOpen] = useState(false);

  const perPage = 50;

  /*
  =====================================
  LOAD FILTERS
  =====================================
  */

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [countryRes, modeRes, yearRes] = await Promise.all([
        fetch(`${API}/filters/countries`),
        fetch(`${API}/filters/modes`),
        fetch(`${API}/filters/years`),
      ]);

      if (!countryRes.ok || !modeRes.ok || !yearRes.ok) {
        throw new Error('Failed to load filters');
      }

      const countryJson = await countryRes.json();
      const modeJson = await modeRes.json();
      const yearJson = await yearRes.json();

      setCountries(countryJson || []);
      setModes(modeJson || []);
      setYears(yearJson || []);
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  };

  /*
  =====================================
  FETCH DATA
  =====================================
  */

  useEffect(() => {
    fetchData();
  }, [page, query, countryFilter, modeFilter, yearFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set('limit', String(perPage));
      params.set('offset', String(page * perPage));

      if (query) {
        params.set('search', query);
      }

      if (countryFilter !== 'all') {
        params.set('country', countryFilter);
      }

      if (modeFilter !== 'all') {
        params.set('mode_shipment', modeFilter);
      }

      if (yearFilter !== 'all') {
        params.set('year', yearFilter);
      }

      const res = await fetch(`${API}/companies?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to fetch shipments');
      }

      const json = await res.json();

      setRows(json.data || []);
      setTotalCount(json.total || 0);
    } catch (err) {
      console.error('Error fetching data:', err);
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
  SELECT / DESELECT
  =====================================
  */

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  };

  /*
  =====================================
  GET RECIPIENTS
  =====================================
  */

  const getRecipients = () => {
    return rows
      .filter((r) => selected.has(r.id))
      .map((r) => ({
        name: r.exporter_name,
        email: r.email || '',
        company: r.exporter_name,
      }))
      .filter((r) => r.email);
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Search Shipments</h1>

        <Button
          onClick={() => setEmailOpen(true)}
          disabled={selected.size === 0}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          Send Email ({selected.size})
        </Button>
      </div>

      {/* FILTERS */}

      <div className="flex gap-3 mb-4 flex-wrap md:flex-nowrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search exporter, product, HSN..."
            value={query}
            onChange={(e) => {
              setPage(0);
              setQuery(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        {/* COUNTRY FILTER */}

        <Select
          value={countryFilter}
          onValueChange={(v) => {
            setPage(0);
            setCountryFilter(v);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Country" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>

            {countries.map((c) => (
              <SelectItem
                key={c.country_of_discharge}
                value={c.country_of_discharge || ''}
              >
                {c.country_of_discharge}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* MODE FILTER */}

        <Select
          value={modeFilter}
          onValueChange={(v) => {
            setPage(0);
            setModeFilter(v);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>

            {modes.map((m) => (
              <SelectItem
                key={m.mode_shipment}
                value={m.mode_shipment || ''}
              >
                {m.mode_shipment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* YEAR FILTER */}

        <Select
          value={yearFilter}
          onValueChange={(v) => {
            setPage(0);
            setYearFilter(v);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>

            {years.map((y) => (
              <SelectItem key={y.year} value={String(y.year)}>
                {y.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PAGINATION INFO */}

      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-muted-foreground">
          Showing {rows.length} of {totalCount}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="px-3 py-1 text-sm">
            Page {page + 1} / {totalPages || 1}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">
              No shipments found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="p-3 w-10 text-left">
                  <Checkbox
                    checked={
                      selected.size === rows.length && rows.length > 0
                    }
                    onCheckedChange={selectAll}
                  />
                </th>

                <th className="p-3 text-left font-semibold">
                  Exporter
                </th>

                <th className="p-3 text-left font-semibold">
                  Country
                </th>

                <th className="p-3 text-left font-semibold">
                  Product
                </th>

                <th className="p-3 text-left font-semibold">
                  HSN
                </th>

                <th className="p-3 text-left font-semibold">
                  Mode
                </th>

                <th className="p-3 text-right font-semibold">
                  FOB Value
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                    />
                  </td>

                  <td className="p-3 font-medium">{r.exporter_name}</td>

                  <td className="p-3">{r.country_of_discharge}</td>

                  <td className="p-3 max-w-xs truncate" title={r.product_description}>
                    {r.product_description}
                  </td>

                  <td className="p-3 font-mono text-xs">
                    {r.hsncode}
                  </td>

                  <td className="p-3">{r.mode_shipment}</td>

                  <td className="p-3 text-right font-medium">
                    {r.fob_value_currency}{' '}
                    {Number(r.total_fob_value).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EMAIL MODAL */}

      <EmailModal
        open={emailOpen}
        recipients={getRecipients()}
        product={query || 'Shipment Products'}
        onClose={() => setEmailOpen(false)}
      />
    </div>
  );
}