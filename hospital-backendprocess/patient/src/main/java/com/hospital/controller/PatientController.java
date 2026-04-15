package com.hospital.controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.model.DoctorVistitDetails;
import com.hospital.model.Patient;
import com.hospital.repo.PatientDoctorVistiDetails;
import com.hospital.service.PatientService;

@CrossOrigin
@RestController
@RequestMapping("/api/patients")
public class PatientController {

  private final PatientService patientService;
  private static final List<DateTimeFormatter> APPOINTMENT_DATE_FORMATS = List.of(
    DateTimeFormatter.ISO_LOCAL_DATE,
    DateTimeFormatter.ofPattern("dd-MM-yyyy"),
    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
    DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH),
    DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.ENGLISH)
  );

  @Autowired
  private PatientDoctorVistiDetails pdv;
  @Value("${app.aiInternalKey:}")
  private String aiInternalKey;

  public PatientController(PatientService patientService) {
    this.patientService = patientService;
  }

  @GetMapping("/pp")
  public String patientget(){
    return "Patient Service";
  }

  @PostMapping("/add")
  @PreAuthorize("hasRole('ADMIN')")
  public Patient registerPatient(@RequestBody Patient patient) {
    return patientService.registerPatient(patient);
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public Patient getPatient(@PathVariable Long id) {
    return patientService.getPatientById(id);
  }

  @GetMapping("/all")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<Patient> getall() {
    return patientService.getAllPatient();
  }

  @GetMapping("/list-with-latest-visit")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<Map<String, Object>> getPatientsWithLatestVisit() {
    List<Patient> patients = patientService.getAllPatient();
    List<Map<String, Object>> response = new ArrayList<>();

    for (Patient patient : patients) {
      DoctorVistitDetails latestVisit = pdv.findLatestVisitByPatient(patient.getId());

      Map<String, Object> row = new HashMap<>();
      row.put("patient", patient);
      row.put(
        "latestDoctorName",
        latestVisit != null ? latestVisit.getDoctor_name() : null
      );
      row.put(
        "latestVisitDate",
        latestVisit != null ? latestVisit.getAppointmentDate() : null
      );

      response.add(row);
    }

    return response;
  }

  @GetMapping("/dashboard/today")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> getTodayDashboard() {
    return ResponseEntity.ok(patientService.getTodayDashboard());
  }

  @GetMapping("/dashboard/today/inpatient")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> getTodayInpatientDashboard() {
    return ResponseEntity.ok(patientService.getTodayInpatientDashboard());
  }

  @GetMapping("/dashboard/today/outpatient")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> getTodayOutpatientDashboard() {
    return ResponseEntity.ok(patientService.getTodayOutpatientDashboard());
  }

  @PostMapping("/assign-doctor")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<?> addVistiDetails(
    @RequestBody DoctorVistitDetails dd
  ) {
    if (dd.getPatientId() <= 0 || dd.getDoctorId() <= 0) {
      return ResponseEntity.badRequest().body("patientId and doctorId are required");
    }
    Patient patient = patientService.getPatientById(dd.getPatientId());
    if (patient == null) {
      return ResponseEntity.badRequest().body("Invalid patientId");
    }
    if (dd.getPatientName() == null || dd.getPatientName().isBlank()) {
      dd.setPatientName(
        (patient.getFirstName() == null ? "" : patient.getFirstName()) +
        (patient.getLastName() == null ? "" : (" " + patient.getLastName()))
      );
    }
    return ResponseEntity.ok(pdv.save(dd));
  }

  @GetMapping("/appointments")
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ResponseEntity<List<Map<String, Object>>> getAppointments(
    @RequestParam(required = false) String date
  ) {
    LocalDate filterDate = parseDateValue(date);
    DayOfWeek filterDay = filterDate != null ? filterDate.getDayOfWeek() : null;
    List<Map<String, Object>> response = new ArrayList<>();

    for (DoctorVistitDetails visit : pdv.findAll()) {
      String visitDateRaw = visit.getAppointmentDate();
      LocalDate visitDateParsed = parseDateValue(visitDateRaw);
      if (
        filterDate != null &&
        !matchesDateFilter(visitDateRaw, visitDateParsed, filterDate, filterDay)
      ) {
        continue;
      }

      Patient patient = patientService.getPatientById(visit.getPatientId());
      Map<String, Object> row = new HashMap<>();
      row.put("visitId", visit.getId());
      row.put("patientId", visit.getPatientId());
      row.put("doctorId", visit.getDoctorId());
      row.put("doctorName", visit.getDoctor_name());
      row.put("patientName", visit.getPatientName());
      row.put("appointmentTime", visit.getAppointmentTime());
      row.put("appointmentDate", visitDateRaw);
      row.put("visitDate", visitDateParsed != null ? visitDateParsed.toString() : visitDateRaw);
      row.put("status", "scheduled");
      row.put("treatmentType", visit.getTreatmentType());
      row.put("patientMode", visit.getPatientMode());
      row.put("consultationFee", visit.getConsultationFee());
      row.put("patientPhone", patient != null ? patient.getPhoneNumber() : null);
      row.put("patientEmail", patient != null ? patient.getEmail() : null);
      row.put("patientImage", patient != null ? patient.getProfileImage() : null);
      response.add(row);
    }
    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/internal/ai-context", produces = MediaType.TEXT_PLAIN_VALUE)
  public ResponseEntity<String> getAiContext(
    @RequestHeader(value = "X-AI-Internal-Key", required = false) String key
  ) {
    if (aiInternalKey == null || aiInternalKey.isBlank() || !aiInternalKey.equals(key)) {
      return ResponseEntity.status(401).body("unauthorized");
    }

    List<Patient> patients = patientService.getAllPatient();
    if (patients.isEmpty()) {
      return ResponseEntity.ok("Patients total: 0");
    }

    StringBuilder body = new StringBuilder();
    body.append("Patients total: ").append(patients.size()).append("\n");
    int limit = Math.min(200, patients.size());
    for (int i = 0; i < limit; i++) {
      Patient p = patients.get(i);
      body
        .append("id=")
        .append(p.getId())
        .append(", name=")
        .append(safeText(p.getFirstName()))
        .append(" ")
        .append(safeText(p.getLastName()))
        .append(", email=")
        .append(safeText(p.getEmail()))
        .append(", phone=")
        .append(safeText(p.getPhoneNumber()))
        .append(", mode=")
        .append(safeText(p.getPatientMode()))
        .append(", treatment=")
        .append(safeText(p.getTreatmentType()))
        .append("\n");
    }
    return ResponseEntity.ok(body.toString().trim());
  }

  @GetMapping("/latest/{patientId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<DoctorVistitDetails> getLatestVisit(
    @PathVariable Long patientId
  ) {
    DoctorVistitDetails latest = pdv.findLatestVisitByPatient(patientId);

    if (latest == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(latest);
  }

  @GetMapping("/doctor_visit/{patientId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<DoctorVistitDetails>> getDoctorVisit(
    @PathVariable Long patientId
  ) {
    List<DoctorVistitDetails> latest = pdv.findDoctorVisitHistoryByPatient(patientId);

    if (latest == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(latest);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Patient> updatePatient(
    @PathVariable Long id,
    @RequestBody Patient patientDetails
  ) {
    try {
      // Check if patient exists
      Patient existingPatient = patientService.getPatientById(id);

      if (existingPatient == null) {
        return ResponseEntity.notFound().build();
      }

      // Update patient data
      // Personal Info
      existingPatient.setFirstName(patientDetails.getFirstName());
      existingPatient.setLastName(patientDetails.getLastName());
      existingPatient.setDateOfBirth(patientDetails.getDateOfBirth());
      existingPatient.setGender(patientDetails.getGender());
      existingPatient.setMaritalStatus(patientDetails.getMaritalStatus());
      existingPatient.setOccupation(patientDetails.getOccupation());
      existingPatient.setNationality(patientDetails.getNationality());
      existingPatient.setAadharNumber(patientDetails.getAadharNumber());

      // Contact Info
      existingPatient.setPhoneNumber(patientDetails.getPhoneNumber());
      existingPatient.setAlternatePhone(patientDetails.getAlternatePhone());
      existingPatient.setEmail(patientDetails.getEmail());
      existingPatient.setAddress(patientDetails.getAddress());
      existingPatient.setCity(patientDetails.getCity());
      existingPatient.setState(patientDetails.getState());
      existingPatient.setPincode(patientDetails.getPincode());

      // Medical Info
      existingPatient.setBloodGroup(patientDetails.getBloodGroup());
      existingPatient.setHeight(patientDetails.getHeight());
      existingPatient.setWeight(patientDetails.getWeight());
      existingPatient.setAllergies(patientDetails.getAllergies());
      existingPatient.setChronicDiseases(patientDetails.getChronicDiseases());
      existingPatient.setCurrentMedications(
        patientDetails.getCurrentMedications()
      );
      existingPatient.setPreviousSurgeries(
        patientDetails.getPreviousSurgeries()
      );
      existingPatient.setFamilyHistory(patientDetails.getFamilyHistory());
      existingPatient.setSmokingStatus(patientDetails.getSmokingStatus());
      existingPatient.setAlcoholConsumption(
        patientDetails.getAlcoholConsumption()
      );
      existingPatient.setTreatmentType(patientDetails.getTreatmentType());
      existingPatient.setPatientMode(patientDetails.getPatientMode());

      // Emergency Contact
      existingPatient.setEmergencyName(patientDetails.getEmergencyName());
      existingPatient.setEmergencyRelation(
        patientDetails.getEmergencyRelation()
      );
      existingPatient.setEmergencyPhone(patientDetails.getEmergencyPhone());
      existingPatient.setEmergencyAddress(patientDetails.getEmergencyAddress());

      // Insurance Info
      existingPatient.setHasInsurance(patientDetails.getHasInsurance());
      existingPatient.setInsuranceProvider(
        patientDetails.getInsuranceProvider()
      );
      existingPatient.setPolicyNumber(patientDetails.getPolicyNumber());
      existingPatient.setValidUntil(patientDetails.getValidUntil());
      existingPatient.setCoverageAmount(patientDetails.getCoverageAmount());

      // Profile Image
      if (patientDetails.getProfileImage() != null) {
        existingPatient.setProfileImage(patientDetails.getProfileImage());
      }

      // Save the updated patient
      Patient updatedPatient = patientService.updatePatient(existingPatient);

      return ResponseEntity.ok(updatedPatient);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  private LocalDate parseDateValue(String rawDate) {
    if (rawDate == null || rawDate.isBlank()) {
      return null;
    }
    String normalized = rawDate.trim();
    for (DateTimeFormatter formatter : APPOINTMENT_DATE_FORMATS) {
      try {
        return LocalDate.parse(normalized, formatter);
      } catch (DateTimeParseException ignored) {}
    }
    return null;
  }

  private boolean matchesDateFilter(
    String visitDateRaw,
    LocalDate visitDateParsed,
    LocalDate filterDate,
    DayOfWeek filterDay
  ) {
    if (visitDateParsed != null) {
      return visitDateParsed.equals(filterDate);
    }
    if (visitDateRaw == null || visitDateRaw.isBlank()) {
      return false;
    }
    String normalized = visitDateRaw.trim();
    return (
      normalized.equalsIgnoreCase(filterDate.toString()) ||
      normalized.equalsIgnoreCase(filterDay.name()) ||
      normalized.equalsIgnoreCase(capitalizeDay(filterDay))
    );
  }

  private String capitalizeDay(DayOfWeek dayOfWeek) {
    String upper = dayOfWeek.name().toLowerCase(Locale.ENGLISH);
    return Character.toUpperCase(upper.charAt(0)) + upper.substring(1);
  }

  private String safeText(String value) {
    return (value == null || value.isBlank()) ? "n/a" : value;
  }
}
