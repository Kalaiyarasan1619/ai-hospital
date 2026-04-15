package com.hospital.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name= "doctor_visit_details")
public class DoctorVistitDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long patientId;
    private long doctorId;
    private String doctor_name;
    private String patientName;

    private Double consultationFee;

    private String treatmentType;  // Which treatment they came for
    private String patientMode;    // IP or OP

    private String appointmentTime;
    private String appointmentDate;

}
