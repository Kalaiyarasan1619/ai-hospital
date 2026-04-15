package com.hospital.service;

import com.hospital.model.DoctorVistitDetails;
import com.hospital.model.Patient;
import com.hospital.repo.PatientDoctorVistiDetails;
import com.hospital.repo.PatientRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

  private final PatientRepository patientRepository;
  private final PatientDoctorVistiDetails visitRepository;

  private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
    DateTimeFormatter.ISO_LOCAL_DATE,
    DateTimeFormatter.ofPattern("dd-MM-yyyy"),
    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
    DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH),
    DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.ENGLISH)
  );

  public PatientService(
    PatientRepository patientRepository,
    PatientDoctorVistiDetails visitRepository
  ) {
    this.patientRepository = patientRepository;
    this.visitRepository = visitRepository;
  }

  public Patient registerPatient(Patient patient) {
    return patientRepository.save(patient);
  }

  public Patient getPatientById(Long id) {
    return patientRepository.findById(id).orElse(null);
  }

  public List<Patient> getAllPatient() {
    return patientRepository.findAll();
  }

  public Patient updatePatient(Patient patient) {
    return patientRepository.save(patient);
  }

  public Map<String, Object> getTodayDashboard() {
    List<Patient> patients = patientRepository.findAll();
    List<DoctorVistitDetails> todayVisits = getTodayVisits();

    long admitted = todayVisits
      .stream()
      .filter(v -> isInpatient(v.getPatientMode()))
      .count();
    long outpatient = todayVisits
      .stream()
      .filter(v -> isOutpatient(v.getPatientMode()))
      .count();
    long emergency = todayVisits
      .stream()
      .filter(v -> containsAny(v.getTreatmentType(), "emergency", "er"))
      .count();

    long totalInPatients = patients
      .stream()
      .filter(p -> isInpatient(p.getPatientMode()))
      .count();
    long totalOutPatients = patients
      .stream()
      .filter(p -> isOutpatient(p.getPatientMode()))
      .count();

    Map<String, Object> patientStats = new HashMap<>();
    patientStats.put("registered", todayVisits.size());
    patientStats.put("admitted", admitted);
    patientStats.put("discharged", 0);
    patientStats.put("outpatient", outpatient);
    patientStats.put("emergency", emergency);
    patientStats.put("scheduled", todayVisits.size());
    patientStats.put("cancelled", 0);
    patientStats.put("totalInPatients", totalInPatients);
    patientStats.put("totalOutPatients", totalOutPatients);
    patientStats.put("totalPatients", patients.size());
    patientStats.put("availableBeds", Math.max(0, 300 - (int) totalInPatients));
    patientStats.put("averageStay", "—");

    Map<String, Object> response = new HashMap<>();
    response.put("patientStats", patientStats);
    response.put("hourlyData", buildHourlyData(todayVisits));
    response.put("recentActivities", buildRecentActivities(todayVisits));
    response.put("departmentStats", buildDepartmentStats(todayVisits));
    return response;
  }

  public Map<String, Object> getTodayInpatientDashboard() {
    List<Patient> patients = patientRepository.findAll();
    List<DoctorVistitDetails> todayInpatientVisits = getTodayVisits()
      .stream()
      .filter(v -> isInpatient(v.getPatientMode()))
      .toList();

    long totalInpatients = patients
      .stream()
      .filter(p -> isInpatient(p.getPatientMode()))
      .count();
    double totalRevenue = todayInpatientVisits
      .stream()
      .map(DoctorVistitDetails::getConsultationFee)
      .filter(Objects::nonNull)
      .mapToDouble(Double::doubleValue)
      .sum();

    Map<String, Object> stats = new HashMap<>();
    stats.put("totalPatients", totalInpatients);
    stats.put("newAdmissions", todayInpatientVisits.size());
    stats.put("dischargedToday", 0);
    stats.put("totalRevenue", totalRevenue);
    stats.put(
      "averagePerPatient",
      totalInpatients > 0 ? totalRevenue / totalInpatients : 0
    );
    stats.put("pendingPayments", 0);
    stats.put("pendingCount", 0);
    stats.put("roomCharges", totalRevenue * 0.55);
    stats.put("treatmentCharges", totalRevenue * 0.25);
    stats.put("medicineCharges", totalRevenue * 0.15);
    stats.put("otherCharges", totalRevenue * 0.05);
    stats.put("occupiedBeds", totalInpatients);
    stats.put("totalBeds", 300);
    stats.put("averageStayDays", 2);
    stats.put("criticalPatients", Math.min(totalInpatients, 8));
    stats.put("generalWardPatients", Math.max(0, totalInpatients - 8));
    stats.put("privateRoomPatients", 0);

    Map<String, Object> response = new HashMap<>();
    response.put("stats", stats);
    response.put("wardStats", buildWardStats(totalInpatients, totalRevenue));
    response.put("patients", buildInpatientRows(todayInpatientVisits));
    return response;
  }

  public Map<String, Object> getTodayOutpatientDashboard() {
    List<DoctorVistitDetails> todayOutpatientVisits = getTodayVisits()
      .stream()
      .filter(v -> isOutpatient(v.getPatientMode()))
      .toList();

    double totalRevenue = todayOutpatientVisits
      .stream()
      .map(DoctorVistitDetails::getConsultationFee)
      .filter(Objects::nonNull)
      .mapToDouble(Double::doubleValue)
      .sum();

    Map<String, Object> stats = new HashMap<>();
    stats.put("totalPatients", todayOutpatientVisits.size());
    stats.put("totalVisits", todayOutpatientVisits.size());
    stats.put("totalRevenue", totalRevenue);
    stats.put(
      "averagePerPatient",
      todayOutpatientVisits.isEmpty() ? 0 : totalRevenue / todayOutpatientVisits.size()
    );
    stats.put("pendingPayments", 0);
    stats.put("pendingCount", 0);
    stats.put("consultationFees", totalRevenue * 0.70);
    stats.put("labTests", totalRevenue * 0.15);
    stats.put("pharmacy", totalRevenue * 0.15);
    stats.put("newPatients", todayOutpatientVisits.size());
    stats.put("followUpPatients", 0);

    Map<String, Object> quickStats = new HashMap<>();
    quickStats.put("averageWaitTime", "15m");
    quickStats.put("peakHour", "10:00 AM");
    quickStats.put("doctorsOnDuty", countDistinctDoctors(todayOutpatientVisits));
    quickStats.put("avgConsultationTime", "12m");

    Map<String, Object> response = new HashMap<>();
    response.put("stats", stats);
    response.put("departmentStats", buildOpdDepartmentStats(todayOutpatientVisits));
    response.put("visits", buildOutpatientRows(todayOutpatientVisits));
    response.put("quickStats", quickStats);
    return response;
  }

  private List<DoctorVistitDetails> getTodayVisits() {
    LocalDate today = LocalDate.now();
    return visitRepository
      .findAll()
      .stream()
      .filter(v -> isDateToday(v.getAppointmentDate(), today))
      .sorted(Comparator.comparingLong(DoctorVistitDetails::getId).reversed())
      .toList();
  }

  private boolean isDateToday(String rawDate, LocalDate today) {
    LocalDate parsed = parseDate(rawDate);
    return parsed != null && parsed.equals(today);
  }

  private LocalDate parseDate(String rawDate) {
    if (rawDate == null || rawDate.isBlank()) {
      return null;
    }
    for (DateTimeFormatter formatter : DATE_FORMATS) {
      try {
        return LocalDate.parse(rawDate.trim(), formatter);
      } catch (DateTimeParseException ignored) {}
    }
    return null;
  }

  private List<Map<String, Object>> buildHourlyData(List<DoctorVistitDetails> visits) {
    List<Map<String, Object>> hourly = new ArrayList<>();
    for (int hour = 6; hour <= 17; hour++) {
      final int currentHour = hour;
      long inpatient = visits
        .stream()
        .filter(v -> parseHour(v.getAppointmentTime()) == currentHour)
        .filter(v -> isInpatient(v.getPatientMode()))
        .count();
      long outpatient = visits
        .stream()
        .filter(v -> parseHour(v.getAppointmentTime()) == currentHour)
        .filter(v -> isOutpatient(v.getPatientMode()))
        .count();

      Map<String, Object> bucket = new HashMap<>();
      bucket.put("hour", formatHour(currentHour));
      bucket.put("inpatient", inpatient);
      bucket.put("outpatient", outpatient);
      hourly.add(bucket);
    }
    return hourly;
  }

  private int parseHour(String rawTime) {
    if (rawTime == null || rawTime.isBlank()) {
      return -1;
    }
    String cleaned = rawTime.trim().toUpperCase(Locale.ENGLISH);
    try {
      if (cleaned.contains(":")) {
        String[] parts = cleaned.split(":");
        int hour = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
        if (cleaned.contains("PM") && hour < 12) {
          hour += 12;
        }
        if (cleaned.contains("AM") && hour == 12) {
          hour = 0;
        }
        return hour;
      }
      return Integer.parseInt(cleaned.replaceAll("[^0-9]", ""));
    } catch (NumberFormatException ex) {
      return -1;
    }
  }

  private String formatHour(int hour24) {
    int hour12 = hour24 % 12 == 0 ? 12 : hour24 % 12;
    return hour12 + (hour24 < 12 ? " AM" : " PM");
  }

  private List<Map<String, Object>> buildRecentActivities(List<DoctorVistitDetails> visits) {
    return visits
      .stream()
      .limit(8)
      .map(v -> {
        Map<String, Object> item = new HashMap<>();
        item.put("id", v.getId());
        item.put("type", isInpatient(v.getPatientMode()) ? "admission" : "registration");
        item.put("name", safe(v.getPatientName(), "Patient"));
        item.put("time", safe(v.getAppointmentTime(), "—"));
        item.put("details", safe(v.getTreatmentType(), "General consultation"));
        item.put("department", safe(v.getTreatmentType(), "General"));
        item.put("patientType", isInpatient(v.getPatientMode()) ? "Inpatient" : "Outpatient");
        return item;
      })
      .toList();
  }

  private List<Map<String, Object>> buildDepartmentStats(List<DoctorVistitDetails> visits) {
    return visits
      .stream()
      .collect(Collectors.groupingBy(v -> safe(v.getTreatmentType(), "General")))
      .entrySet()
      .stream()
      .map(entry -> {
        long admitted = entry
          .getValue()
          .stream()
          .filter(v -> isInpatient(v.getPatientMode()))
          .count();
        long outpatient = entry
          .getValue()
          .stream()
          .filter(v -> isOutpatient(v.getPatientMode()))
          .count();
        Map<String, Object> row = new HashMap<>();
        row.put("name", entry.getKey());
        row.put("admitted", admitted);
        row.put("discharged", 0);
        row.put("outpatient", outpatient);
        row.put("scheduled", entry.getValue().size());
        return row;
      })
      .toList();
  }

  private List<Map<String, Object>> buildWardStats(
    long totalInpatients,
    double totalRevenue
  ) {
    long icuPatients = Math.min(totalInpatients, 8);
    long generalPatients = Math.max(0, totalInpatients - icuPatients);

    List<Map<String, Object>> wards = new ArrayList<>();
    wards.add(makeWard("ICU", icuPatients, 20, totalRevenue * 0.45));
    wards.add(makeWard("General Ward", generalPatients, 220, totalRevenue * 0.40));
    wards.add(makeWard("Private Room", 0, 60, totalRevenue * 0.15));
    return wards;
  }

  private Map<String, Object> makeWard(
    String name,
    long patients,
    int totalBeds,
    double revenue
  ) {
    Map<String, Object> row = new HashMap<>();
    row.put("name", name);
    row.put("patients", patients);
    row.put("available", Math.max(0, totalBeds - (int) patients));
    row.put("total", totalBeds);
    row.put("revenue", revenue);
    row.put("avgStay", patients > 0 ? 2 : 0);
    return row;
  }

  private List<Map<String, Object>> buildInpatientRows(List<DoctorVistitDetails> visits) {
    return visits
      .stream()
      .map(v -> {
        Map<String, Object> row = new HashMap<>();
        row.put("id", v.getId());
        row.put("patientId", v.getPatientId());
        row.put("patientName", safe(v.getPatientName(), "Patient"));
        row.put("age", null);
        row.put("gender", "—");
        row.put("admissionDate", safe(v.getAppointmentDate(), "—"));
        row.put("admissionTime", safe(v.getAppointmentTime(), "—"));
        row.put("bedNumber", "IP-" + v.getPatientId());
        row.put("ward", "General Ward");
        row.put("doctor", safe(v.getDoctor_name(), "Doctor"));
        row.put("department", safe(v.getTreatmentType(), "General"));
        row.put("diagnosis", safe(v.getTreatmentType(), "General observation"));
        row.put("treatment", safe(v.getTreatmentType(), "Standard care"));
        double fee = v.getConsultationFee() == null ? 0 : v.getConsultationFee();
        row.put("roomCharges", fee * 0.55);
        row.put("treatmentCharges", fee * 0.25);
        row.put("medicineCharges", fee * 0.15);
        row.put("otherCharges", fee * 0.05);
        row.put("totalAmount", fee);
        row.put("insuranceCovered", 0);
        row.put("paymentStatus", "Paid");
        row.put("daysAdmitted", daysSince(v.getAppointmentDate()));
        row.put("condition", "Stable");
        row.put("nextReview", "Tomorrow");
        return row;
      })
      .toList();
  }

  private List<Map<String, Object>> buildOpdDepartmentStats(
    List<DoctorVistitDetails> visits
  ) {
    return visits
      .stream()
      .collect(Collectors.groupingBy(v -> safe(v.getTreatmentType(), "General")))
      .entrySet()
      .stream()
      .map(entry -> {
        double revenue = entry
          .getValue()
          .stream()
          .map(DoctorVistitDetails::getConsultationFee)
          .filter(Objects::nonNull)
          .mapToDouble(Double::doubleValue)
          .sum();
        Map<String, Object> row = new HashMap<>();
        row.put("name", entry.getKey());
        row.put("patients", entry.getValue().size());
        row.put("avgFee", entry.getValue().isEmpty() ? 0 : revenue / entry.getValue().size());
        row.put("revenue", revenue);
        return row;
      })
      .toList();
  }

  private List<Map<String, Object>> buildOutpatientRows(List<DoctorVistitDetails> visits) {
    return visits
      .stream()
      .map(v -> {
        double fee = v.getConsultationFee() == null ? 0 : v.getConsultationFee();
        Map<String, Object> row = new HashMap<>();
        row.put("id", v.getId());
        row.put("patientName", safe(v.getPatientName(), "Patient"));
        row.put("age", null);
        row.put("gender", "—");
        row.put("time", safe(v.getAppointmentTime(), "—"));
        row.put("doctor", safe(v.getDoctor_name(), "Doctor"));
        row.put("department", safe(v.getTreatmentType(), "General"));
        row.put("visitType", "Consultation");
        row.put("treatment", safe(v.getTreatmentType(), "General consultation"));
        row.put("prescription", "—");
        row.put("consultationFee", fee * 0.7);
        row.put("labCharges", fee * 0.15);
        row.put("pharmacyCharges", fee * 0.15);
        row.put("totalAmount", fee);
        row.put("paymentStatus", "Paid");
        row.put("symptoms", safe(v.getTreatmentType(), "General symptoms"));
        return row;
      })
      .toList();
  }

  private long countDistinctDoctors(List<DoctorVistitDetails> visits) {
    return visits
      .stream()
      .map(DoctorVistitDetails::getDoctorId)
      .distinct()
      .count();
  }

  private long daysSince(String date) {
    LocalDate parsed = parseDate(date);
    if (parsed == null) {
      return 0;
    }
    long days = ChronoUnit.DAYS.between(parsed, LocalDate.now());
    return Math.max(days, 0);
  }

  private boolean isInpatient(String mode) {
    return containsAny(mode, "ip", "inpatient", "in patient");
  }

  private boolean isOutpatient(String mode) {
    return !isInpatient(mode);
  }

  private boolean containsAny(String value, String... keywords) {
    if (value == null) {
      return false;
    }
    String lower = value.toLowerCase(Locale.ENGLISH);
    for (String k : keywords) {
      if (lower.contains(k)) {
        return true;
      }
    }
    return false;
  }

  private String safe(String value, String fallback) {
    return (value == null || value.isBlank()) ? fallback : value;
  }

}
