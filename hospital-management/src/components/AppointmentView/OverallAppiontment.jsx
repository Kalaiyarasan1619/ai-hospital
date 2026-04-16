import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorAssignmentModal from '../Patient/DoctorAssignmentModal';
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// const PATIENT_API = 'http://localhost:8082/api/patients';
// const DOCTOR_API = 'http://localhost:8081/api/doctors';

const PATIENT_API = 'https://ai-hospital-patient-service.onrender.com/api/patients';
const DOCTOR_API = 'https://ai-hospital-doctor.onrender.com/api/doctors';

function getToken() {
  let t = localStorage.getItem('token');
  if (t) t = t.replace(/"/g, '');
  return t;
}

function isAdminRole() {
  const r = localStorage.getItem('role');
  if (!r) return false;
  return r.includes('ROLE_ADMIN');
}

function formatIsoDate(d) {
  if (!d) return '';
  const x = typeof d === 'string' ? d.slice(0, 10) : d;
  return x;
}

function patientDisplayName(p) {
  const n = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  if (n) return n;
  if (p.name) return p.name;
  return `Patient #${p.id}`;
}

const OverallAppointment = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [rawAppointments, setRawAppointments] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPatientId, setAssignPatientId] = useState(null);
  const [assignPatientName, setAssignPatientName] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [patientPickerList, setPatientPickerList] = useState([]);
  const [pickerPatientId, setPickerPatientId] = useState('');

  const admin = isAdminRole();

  const loadDoctors = useCallback(async () => {
    const token = getToken();
    if (!token) return {};
    const res = await fetch(`${DOCTOR_API}/all`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return {};
    const list = await res.json();
    const map = {};
    (Array.isArray(list) ? list : []).forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, []);

  const loadAppointments = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Please sign in to view appointments.');
      setLoading(false);
      return;
    }
    const q = filterDate ? `?date=${encodeURIComponent(filterDate)}` : '';
    const res = await fetch(`${PATIENT_API}/appointments${q}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to load appointments');
    }
    const data = await res.json();
    setRawAppointments(Array.isArray(data) ? data : []);
  }, [filterDate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dmap = await loadDoctors();
        if (!cancelled) setDoctorsById(dmap);
      } catch {
        if (!cancelled) setDoctorsById({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadDoctors, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadAppointments();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAppointments, refreshKey]);

  const appointments = useMemo(() => {
    return rawAppointments.map((row) => {
      const doc = doctorsById[row.doctorId];
      const dateStr = formatIsoDate(row.visitDate || row.appointmentDate);
      return {
        id: String(row.visitId ?? row.id),
        visitId: row.visitId ?? row.id,
        patientId: row.patientId,
        patient: {
          name: row.patientName || 'Patient',
          phone: row.patientPhone || '—',
          email: row.patientEmail || '',
          image: row.patientImage,
        },
        doctor: {
          name: row.doctorName || row.doctor_name || 'Doctor',
          specialization: doc?.specialization || '—',
          department: doc?.department || '—',
          image:
            doc?.profileImage ||
            'https://ui-avatars.com/api/?name=Dr&background=0ea5e9&color=fff',
        },
        date: dateStr,
        time: row.appointmentTime || '—',
        duration: '—',
        type: row.patientMode === 'IP' ? 'Inpatient' : 'Outpatient',
        status: (row.status || 'scheduled').toLowerCase(),
        reason: row.treatmentType || 'Consultation',
        notes: '',
        roomNumber: row.patientMode === 'IP' ? 'IPD' : 'OPD',
        appointmentNumber: row.visitId ?? row.id,
        consultationFee: row.consultationFee,
        dischargeDate: row.dischargeDate,
      };
    });
  }, [rawAppointments, doctorsById]);

  const departments = useMemo(() => {
    const set = new Set(appointments.map((a) => a.doctor.department).filter(Boolean));
    return ['all', ...set];
  }, [appointments]);

  const filteredAppointments = appointments.filter((appointment) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      appointment.patient.name.toLowerCase().includes(q) ||
      appointment.doctor.name.toLowerCase().includes(q) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(q));

    const matchesDate =
      !filterDate || appointment.date === filterDate;
    const matchesStatus =
      selectedStatus === 'all' || appointment.status === selectedStatus;
    const matchesDepartment =
      selectedDepartment === 'all' ||
      appointment.doctor.department === selectedDepartment;

    return matchesSearch && matchesDate && matchesStatus && matchesDepartment;
  });

  const stats = {
    total: filteredAppointments.length,
    confirmed: filteredAppointments.filter((a) => a.status === 'confirmed').length,
    waiting: filteredAppointments.filter((a) => a.status === 'waiting').length,
    completed: filteredAppointments.filter((a) => a.status === 'completed').length,
    cancelled: filteredAppointments.filter((a) => a.status === 'cancelled').length,
    scheduled: filteredAppointments.filter((a) => a.status === 'scheduled').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'waiting':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      case 'scheduled':
        return <CalendarIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  const openAssignModalForPatient = (p) => {
    setAssignPatientId(p.id);
    setAssignPatientName(patientDisplayName(p));
    setAssignModalOpen(true);
  };

  const handleBookDoctorClick = async () => {
    const token = getToken();
    if (!token) {
      alert('Please sign in first.');
      return;
    }
    setBookLoading(true);
    try {
      const res = await fetch(`${PATIENT_API}/all`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Could not load patients');
      const data = await res.json();
      const patients = Array.isArray(data) ? data : [];

      let accountEmail = null;
      try {
        const raw = localStorage.getItem('user');
        if (raw) accountEmail = JSON.parse(raw).email;
      } catch {
        accountEmail = null;
      }

      const matched = patients.filter(
        (p) =>
          p.email &&
          accountEmail &&
          String(p.email).toLowerCase() === String(accountEmail).toLowerCase()
      );

      if (matched.length >= 1) {
        openAssignModalForPatient(matched[0]);
        return;
      }

      if (admin && patients.length > 0) {
        const sorted = patients
          .slice()
          .sort((a, b) => patientDisplayName(a).localeCompare(patientDisplayName(b)));
        setPatientPickerList(sorted);
        setPickerPatientId(String(sorted[0].id));
        setPatientPickerOpen(true);
        return;
      }

      const goRegister = window.confirm(
        'No patient record matches your login email. Register a patient profile (use the same email as your account) to book visits.'
      );
      if (goRegister) navigate('/patients/register');
    } catch (e) {
      alert(e.message || 'Failed to prepare booking');
    } finally {
      setBookLoading(false);
    }
  };

  const confirmAdminPatientPicker = () => {
    const p = patientPickerList.find((x) => String(x.id) === String(pickerPatientId));
    if (!p) return;
    setPatientPickerOpen(false);
    openAssignModalForPatient(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-pink-50/50 to-sky-100 p-4 sm:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-sky-200/20" />
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-200/90 bg-white/90 px-3 py-1 text-xs font-medium text-sky-900 shadow-sm backdrop-blur">
              {admin ? (
                <>
                  <ShieldCheckIcon className="h-4 w-4 text-pink-500" />
                  Administrator view — all patient visits
                </>
              ) : (
                <>
                  <UserCircleIcon className="h-4 w-4 text-sky-600" />
                  Your visits — patients linked to your account email
                </>
              )}
            </div>
            <h1 className="bg-gradient-to-r from-sky-600 via-sky-500 to-pink-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Visits &amp; appointments
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Live data from the patient service. Doctors list enriches department and profile
              images from the doctor service. Sign in via the user service (JWT).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBookDoctorClick}
              disabled={bookLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-pink-400 disabled:opacity-60"
            >
              <PlusIcon className="h-5 w-5" />
              {bookLoading ? 'Loading…' : 'Book with a doctor'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-pink-200 bg-pink-50/90 px-4 py-3 text-sm text-pink-900">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total', value: stats.total, accent: 'border-sky-500 text-sky-800' },
            { label: 'Scheduled', value: stats.scheduled, accent: 'border-pink-400 text-pink-800' },
            { label: 'Confirmed', value: stats.confirmed, accent: 'border-sky-400 text-sky-900' },
            { label: 'Waiting', value: stats.waiting, accent: 'border-amber-400 text-amber-900' },
            { label: 'Completed', value: stats.completed, accent: 'border-fuchsia-400 text-fuchsia-900' },
            { label: 'Cancelled', value: stats.cancelled, accent: 'border-rose-400 text-rose-900' },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border-l-4 ${s.accent} bg-white/95 p-4 shadow-md shadow-sky-100/50 backdrop-blur`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-sky-100 bg-white/95 p-4 shadow-md shadow-pink-100/30 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, or reason…"
                className="w-full rounded-xl border border-sky-100 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-xl border border-sky-100 bg-white px-3 py-3 text-slate-900 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
              />
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="rounded-xl border border-pink-100 bg-gradient-to-r from-sky-50 to-pink-50 px-4 py-3 text-sm font-medium text-slate-700 hover:from-sky-100 hover:to-pink-100"
              >
                All dates
              </button>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-sky-100 bg-white px-3 py-3 text-slate-900 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
              >
                <option value="all">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="rounded-xl border border-sky-100 bg-white px-3 py-3 text-slate-900 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
              >
                <option value="all">All departments</option>
                {departments.slice(1).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-gradient-to-r from-sky-50 to-pink-50 px-4 py-3 text-sm font-medium text-sky-900 hover:from-sky-100 hover:to-pink-100 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Server filter: {filterDate ? `visits on ${filterDate}` : 'all visit dates loaded'}.
            Client filters apply on top.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/80 p-12 text-center text-sky-900/80">
            Loading appointments…
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-lg shadow-sky-200/40 transition hover:border-pink-200 hover:shadow-xl hover:shadow-pink-200/30"
              >
                <div className="relative bg-gradient-to-r from-sky-500 via-sky-400 to-pink-500 px-5 py-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sky-50">
                        <CalendarIcon className="h-5 w-5 shrink-0" />
                        <span className="font-medium">{appointment.date || '—'}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <ClockIcon className="h-5 w-5 shrink-0 text-pink-100" />
                        <span className="text-2xl font-bold tracking-tight">{appointment.time}</span>
                        <span className="text-sm text-sky-100">({appointment.duration})</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-xs font-semibold capitalize text-white backdrop-blur">
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Patient
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={appointment.patient.image}
                        alt=""
                        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{appointment.patient.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                          <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{appointment.patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Doctor
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={appointment.doctor.image}
                        alt=""
                        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{appointment.doctor.name}</p>
                        <p className="text-sm text-slate-600">{appointment.doctor.specialization}</p>
                        <p className="text-xs text-slate-500">{appointment.doctor.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-sm text-slate-700">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Visit #</span>
                      <span className="font-medium">{appointment.appointmentNumber}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {appointment.type === 'Outpatient' ? (
                        <UserGroupIcon className="h-4 w-4 text-sky-600" />
                      ) : (
                        <VideoCameraIcon className="h-4 w-4 text-pink-600" />
                      )}
                      <span>{appointment.type}</span>
                      <span className="text-slate-400">·</span>
                      <MapPinIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{appointment.roomNumber}</span>
                    </div>
                    {appointment.consultationFee != null && (
                      <p className="mt-2 text-xs text-slate-500">
                        Fee:{' '}
                        <span className="font-medium text-slate-800">{appointment.consultationFee}</span>
                      </p>
                    )}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500">Reason</p>
                      <p className="text-sm text-slate-700">{appointment.reason}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-pink-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-sky-300/40 hover:from-sky-500 hover:to-pink-400"
                      onClick={() =>
                        navigate(
                          appointment.patientId
                            ? `/patients/${appointment.patientId}`
                            : '/patient'
                        )
                      }
                    >
                      <EyeIcon className="h-4 w-4" />
                      Open patient
                    </button>
                    {admin && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg border border-pink-200 bg-pink-50/80 px-3 py-2 text-pink-800 hover:bg-pink-100"
                        title="Admin tools"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredAppointments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-pink-200 bg-gradient-to-br from-white via-sky-50/50 to-pink-50/40 p-12 text-center">
            <CalendarIcon className="mx-auto mb-4 h-14 w-14 text-sky-300" />
            <h3 className="bg-gradient-to-r from-sky-600 to-pink-500 bg-clip-text text-lg font-semibold text-transparent">
              No appointments match
            </h3>
            <p className="mt-2 text-slate-600">
              Adjust filters or use <strong>Book with a doctor</strong> to open the assignment
              modal.
            </p>
          </div>
        )}

        {assignModalOpen && assignPatientId != null && (
          <DoctorAssignmentModal
            isOpen={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            patientId={assignPatientId}
            patientName={assignPatientName}
            onAssign={() => handleRefresh()}
          />
        )}

        {patientPickerOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-sky-950/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-2xl shadow-pink-200/40">
              <div className="bg-gradient-to-r from-sky-500 to-pink-500 px-6 py-4 text-white">
                <h3 className="text-lg font-semibold">Select patient</h3>
                <p className="mt-1 text-sm text-sky-50">
                  Choose who this visit is for. You are booking as an administrator.
                </p>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-slate-700">Patient</label>
                <select
                  className="mt-1 w-full rounded-xl border border-sky-100 px-3 py-2.5 text-slate-900 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-sky-400/35"
                  value={pickerPatientId}
                  onChange={(e) => setPickerPatientId(e.target.value)}
                >
                  {patientPickerList.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {patientDisplayName(p)}
                      {p.email ? ` — ${p.email}` : ''}
                    </option>
                  ))}
                </select>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-sky-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50"
                    onClick={() => setPatientPickerOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-400 hover:to-pink-400"
                    onClick={confirmAdminPatientPicker}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverallAppointment;
