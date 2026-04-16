package com.hospital.pharmacy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-hospital-hazel.vercel.app",
        "https://ai-hospital-pharmacy.onrender.com",
        "https://ai-hospital-python-ai-service.onrender.com"
})
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    @Value("${app.aiInternalKey:}")
    private String aiInternalKey;

    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> getPharmacyDetails() {
        return ResponseEntity.ok(buildPharmacyPayload());
    }

    /**
     * Plain-text snapshot for RAG (same facts as {@link #getPharmacyDetails()} until a DB is wired).
     */
    @GetMapping(value = "/internal/ai-context", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> aiContextForRag(
            @RequestHeader(value = "X-AI-Internal-Key", required = false) String key) {
        if (aiInternalKey == null || aiInternalKey.isBlank() || !aiInternalKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(buildPharmacyRagText());
    }

    private Map<String, Object> buildPharmacyPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("title", "Pharmacy Details");
        payload.put("description", "Central pharmacy view for medicine availability and delivery support across all hospital services.");
        payload.put("summary", Map.of(
                "totalMedicines", 312,
                "lowStockItems", 18,
                "todayDispensed", 146,
                "criticalAvailable", 42
        ));
        payload.put("services", List.of(
                createService("OP Pharmacy", "Fast issue counter for outpatient prescriptions and refill support."),
                createService("IP Ward Supply", "Scheduled medicine delivery for inpatients and nursing stations."),
                createService("Critical Medicines", "Priority stock for ICU and emergency treatment requirements."),
                createService("Inventory Batches", "Batch-wise tracking with expiry monitoring and low-stock alerts.")
        ));
        return payload;
    }

    private String buildPharmacyRagText() {
        Map<String, Object> p = buildPharmacyPayload();
        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) p.get("summary");
        @SuppressWarnings("unchecked")
        List<Map<String, String>> services = (List<Map<String, String>>) p.get("services");

        StringBuilder sb = new StringBuilder();
        sb.append(p.get("title")).append("\n").append(p.get("description")).append("\n\n");
        sb.append("Summary metrics:\n");
        summary.forEach((k, v) -> sb.append("- ").append(k).append(": ").append(v).append('\n'));
        sb.append("\nServices:\n");
        if (services != null) {
            sb.append(
                    services.stream()
                            .map(s -> "- " + s.get("title") + ": " + s.get("detail"))
                            .collect(Collectors.joining("\n")));
        }
        sb.append("\n\n(When you connect pharmacy to a real database, extend this text builder from JPA entities.)\n");
        return sb.toString();
    }

    private Map<String, String> createService(String title, String detail) {
        return Map.of("title", title, "detail", detail);
    }
}
