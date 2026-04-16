import React, { useEffect, useState } from 'react';
import { BeakerIcon, CubeIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PHARMACY_API = 'https://ai-hospital-pharmacy.onrender.com/api/pharmacy';

const PHARMACY_APIS = [
  PHARMACY_API + '/details',
];

const iconByService = {
  'OP Pharmacy': BeakerIcon,
  'IP Ward Supply': TruckIcon,
  'Critical Medicines': ShieldCheckIcon,
  'Inventory Batches': CubeIcon,
};

const Pharmacy = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [apiSource, setApiSource] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      for (const apiUrl of PHARMACY_APIS) {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            continue;
          }
          const payload = await response.json();
          setData(payload);
          setApiSource(apiUrl);
          setLoading(false);
          return;
        } catch (_err) {
          // Try next URL if this one is unavailable.
        }
      }

      setError('Cannot reach pharmacy API. Start pharmacy service (8084), and check CORS/server logs.');
      setLoading(false);
    };

    fetchDetails();
  }, []);

  if (loading) {
    return <section className="rounded-2xl bg-white p-6 shadow-md border border-sky-100">Loading pharmacy details...</section>;
  }

  if (error) {
    return <section className="rounded-2xl bg-red-50 p-6 shadow-md border border-red-200 text-red-700">{error}</section>;
  }

  const services = data?.services || [];
  const summary = data?.summary || {};

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md border border-sky-100">
        <h1 className="text-2xl font-bold text-gray-900">{data?.title || 'Pharmacy Details'}</h1>
        <p className="mt-2 text-gray-600">{data?.description || 'Pharmacy information unavailable.'}</p>
        {apiSource && <p className="mt-1 text-xs text-gray-400">Data source: {apiSource}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <article className="rounded-xl bg-white p-4 border border-pink-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Medicines</p>
          <p className="text-2xl font-bold text-gray-800">{summary.totalMedicines ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 border border-pink-100 shadow-sm">
          <p className="text-xs text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">{summary.lowStockItems ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 border border-pink-100 shadow-sm">
          <p className="text-xs text-gray-500">Dispensed Today</p>
          <p className="text-2xl font-bold text-sky-700">{summary.todayDispensed ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 border border-pink-100 shadow-sm">
          <p className="text-xs text-gray-500">Critical Available</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.criticalAvailable ?? 0}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((item) => {
          const IconComponent = iconByService[item.title] || BeakerIcon;
          return (
          <article key={item.title} className="rounded-2xl bg-white p-5 shadow-sm border border-pink-100">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-pink-500 to-sky-500 p-2 text-white">
                <IconComponent className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
            </div>
            <p className="mt-3 text-sm text-gray-600">{item.detail}</p>
          </article>
          );
        })}
      </div>
    </section>
  );
};

export default Pharmacy;
