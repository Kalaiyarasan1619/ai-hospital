package com.hospital.repo;


import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.model.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}

