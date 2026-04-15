package com.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hospital.model.Doctor;
import com.hospital.service.DoctorService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;
    @Value("${app.aiInternalKey:}")
    private String aiInternalKey;

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor) {
        Doctor saved = doctorService.addDoctor(doctor);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }

    @GetMapping(value = "/internal/ai-context", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getAiContext(
            @RequestHeader(value = "X-AI-Internal-Key", required = false) String key) {
        if (aiInternalKey == null || aiInternalKey.isBlank() || !aiInternalKey.equals(key)) {
            return ResponseEntity.status(401).body("unauthorized");
        }

        List<Doctor> doctors = doctorService.getAllDoctors();
        if (doctors.isEmpty()) {
            return ResponseEntity.ok("Doctors total: 0");
        }

        String body = doctors
                .stream()
                .limit(200)
                .map(d -> String.format(
                        "id=%s, name=%s, specialization=%s, department=%s, fee=%s",
                        d.getId(),
                        safe(d.getName()),
                        safe(d.getSpecialization()),
                        safe(d.getDepartment()),
                        d.getConsultationFee() == null ? "n/a" : d.getConsultationFee().toString()))
                .collect(Collectors.joining("\n"));

        return ResponseEntity.ok("Doctors total: " + doctors.size() + "\n" + body);
    }

    private String safe(String value) {
        return (value == null || value.isBlank()) ? "n/a" : value;
    }
}

