package com.hospital.controller;

@RestController
@RequestMapping("/api/doctors")
public class HealthController {
    @GetMapping("/health")
    public String health() {
        return "Health Check";
    }
}