'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const MembersTable = dynamic(() => import('@/components/MembersTable'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
      <span className="ml-3 text-gray-600">Loading members...</span>
    </div>
  ),
});

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    let isCancelled = false;
    async function fetchPage(currentPage, currentSize) {
      const res = await fetch(`/api/users?page=${currentPage}&size=${currentSize}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }

    async function load() {
      try {
        setLoading(true);
        
        if (size === 'all') {
          // Fetch first page with max size 100 to learn totals
          const first = await fetchPage(1, 100);
          if (isCancelled) return;
          let combined = first.data || [];
          const totalCount = first.total || 0;
          setTotal(totalCount);
          if (first.totalPages > 1) {
            const pagePromises = [];
            for (let p = 2; p <= first.totalPages; p++) {
              pagePromises.push(fetchPage(p, 100));
            }
            const pages = await Promise.all(pagePromises);
            if (isCancelled) return;
            for (const payload of pages) {
              combined = combined.concat(payload.data || []);
            }
          }
          setMembers(combined);
          setPage(1);
          setTotalPages(1);
        } else {
          const payload = await fetchPage(page, size);
          if (isCancelled) return;
          setMembers(payload.data || []);
          setTotalPages(payload.totalPages || 1);
          setTotal(payload.total || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setMembers([]);
          setTotalPages(1);
          setTotal(0);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [page, size, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  // Download all members (across all pages) as Excel, including photo/logo/social URLs
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const fetchPage = async (currentPage, currentSize) => {
        const res = await fetch(`/api/users?page=${currentPage}&size=${currentSize}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      };

      const first = await fetchPage(1, 100);
      let combined = first.data || [];
      if (first.totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= first.totalPages; p++) {
          pagePromises.push(fetchPage(p, 100));
        }
        const pages = await Promise.all(pagePromises);
        for (const payload of pages) {
          combined = combined.concat(payload.data || []);
        }
      }

      // Sort by Serial Number (uniqueId) ascending
      combined.sort((a, b) => {
        const av = Number(a?.uniqueId || 0);
        const bv = Number(b?.uniqueId || 0);
        return av - bv;
      });

      const XLSX = await import('xlsx');
      const toAbsolute = (url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `${window.location.origin}${url}`;
      };

      const rows = combined.map((u) => ({
        SerialNumber: u.uniqueId || '',
        MemberId: u.memberId || '',
        Name: u.name || '',
        Email: u.email || '',
        Mobile: u.mobile || '',
        Company: u.companyName || '',
        Profession: u.profession || '',
        IndustrySector: u.industrySector || '',
        LinkedIn: u.social?.linkedin || '',
        Instagram: u.social?.instagram || '',
        Twitter: u.social?.twitter || '',
        Facebook: u.social?.facebook || '',
        PhotoURL: toAbsolute(u.photo || ''),
        LogoURL: toAbsolute(u.logo || ''),
      }));

      // Build worksheet with explicit column order and widths for optimal viewing
      const header = [
        'SerialNumber',
        'MemberId',
        'Name',
        'Email',
        'Mobile',
        'Company',
        'Profession',
        'IndustrySector',
        'LinkedIn',
        'Instagram',
        'Twitter',
        'Facebook',
        'PhotoURL',
        'LogoURL',
      ];

      const ws = XLSX.utils.json_to_sheet(rows, { header });

      // Set sensible column widths (wch = approx characters)
      ws['!cols'] = [
        { wch: 10 }, // SerialNumber
        { wch: 12 }, // MemberId
        { wch: 22 }, // Name
        { wch: 28 }, // Email
        { wch: 14 }, // Mobile
        { wch: 24 }, // Company
        { wch: 18 }, // Profession
        { wch: 18 }, // IndustrySector
        { wch: 28 }, // LinkedIn
        { wch: 24 }, // Instagram
        { wch: 24 }, // Twitter
        { wch: 24 }, // Facebook
        { wch: 40 }, // PhotoURL
        { wch: 40 }, // LogoURL
      ];

      // Add autofilter on header row
      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: header.length - 1 } })
      };
      // Make PhotoURL and LogoURL cells clickable hyperlinks
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let r = range.s.r + 1; r <= range.e.r; r++) {
          // Column indexes based on header above:
          // PhotoURL is index 12, LogoURL is index 13
          const photoCell = XLSX.utils.encode_cell({ r, c: 12 });
          const logoCell = XLSX.utils.encode_cell({ r, c: 13 });
          if (ws[photoCell] && ws[photoCell].v) {
            ws[photoCell].l = { Target: ws[photoCell].v, Tooltip: 'Open Photo' };
          }
          if (ws[logoCell] && ws[logoCell].v) {
            ws[logoCell].l = { Target: ws[logoCell].v, Tooltip: 'Open Logo' };
          }
        }
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');
      const filename = `members_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (e) {
      console.error('Download failed', e);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Manage Members
        </h1>
        {session?.user?.role === 'admin' && (
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 rounded-md text-white text-sm font-semibold shadow-sm hover:opacity-90"
            style={{ backgroundColor: '#061E3E' }}
            title="Download all members (Excel)"
            disabled={downloading}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2 text-white" />
            {downloading ? 'Preparing…' : 'Download Excel'}
          </button>
        )}
      </div>
      
      
      <MembersTable
        members={members}
        isAdmin={session?.user?.role === 'admin'}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        size={size}
        onSizeChange={(newSize) => { setPage(1); setSize(newSize); }}
        totalCount={total}
        onSearch={handleSearch}
      />
    </div>
  );
}







