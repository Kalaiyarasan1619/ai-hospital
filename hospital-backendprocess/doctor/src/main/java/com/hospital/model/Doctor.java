package com.hospital.model;

import com.hospital.config.JsonConverter;
import com.hospital.config.JsonMapConverter;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Entity
@Data
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Info
    private String name;
    private String email;
    private String phone;
    private String dateOfBirth;
    private String gender;
    @Column(columnDefinition = "TEXT")
    private String address;
    private String city;
    private String state;
    private String pincode;
    @Column(columnDefinition = "TEXT")
    private String profileImage;

    // Professional Info
    private String specialization;
    private String department;
    private String qualification;
    private String experience;
    private String registrationNumber;
    private Double consultationFee;

    @ElementCollection
    private List<String> consultationTypes;

    @ElementCollection
    private List<String> languages;

    // Schedule
    @ElementCollection
    private List<String> workingDays;

    @Convert(converter = JsonConverter.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> workingHours;

    // Additional Info
    @Column(columnDefinition = "TEXT")
    private String about;
    @Column(columnDefinition = "TEXT")
    private String awards;
    @Column(columnDefinition = "TEXT")
    private String specializations;
    @Column(columnDefinition = "TEXT")
    private String publications;
}
