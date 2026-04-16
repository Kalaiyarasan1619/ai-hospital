package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "https://ai-hospital-hazel.vercel.app",
    "https://ai-hospital-patient-service.onrender.com",
    "https://ai-hospital-python-ai-service.onrender.com"
})
public class HealthController {

    @GetMapping("/ping")
    public String ping() {
        return "Eureka Server Running 🚀";
    }
}
