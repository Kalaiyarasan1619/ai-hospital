package com.hospital.repo;

import com.hospital.model.DoctorVistitDetails;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientDoctorVistiDetails
  extends JpaRepository<DoctorVistitDetails, Long> {
  @Query(
    value = "SELECT * FROM doctor_visit_details WHERE patient_id = :patientId ORDER BY id DESC LIMIT 1",
    nativeQuery = true
  )
  DoctorVistitDetails findLatestVisitByPatient(
    @Param("patientId") Long patientId
  );

  @Query(
    value = "SELECT * FROM doctor_visit_details WHERE patient_id = :patientId",
    nativeQuery = true
  )
  List<DoctorVistitDetails> findDoctorVisitHistoryByPatient(
    @Param("patientId") long patientId
  );
}
