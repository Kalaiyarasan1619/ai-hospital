package com.hospital.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Info
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private String gender;
    private String maritalStatus;
    private String occupation;
    private String nationality;
    private String aadharNumber;

    // Contact Info
    private String phoneNumber;
    private String alternatePhone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;

    // Medical Info
    private String bloodGroup;
    private String height;
    private String weight;
    private String allergies;
    private String chronicDiseases;
    private String currentMedications;
    private String previousSurgeries;
    private String familyHistory;
    private String smokingStatus;
    private String alcoholConsumption;

    // Emergency Contact
    private String emergencyName;
    private String emergencyRelation;
    private String emergencyPhone;
    private String emergencyAddress;

    // Insurance Info
    private Boolean hasInsurance;
    private String insuranceProvider;
    private String policyNumber;
    private String validUntil;
    private String coverageAmount;

    @Column(columnDefinition = "TEXT")
    private String profileImage;

      // *** NEW FIELDS ***
    private String treatmentType;  // Which treatment they came for
    private String patientMode;    // IP or OP
    

}
