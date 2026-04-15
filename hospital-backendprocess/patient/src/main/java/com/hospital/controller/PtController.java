package com.hospital.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ppt")
public class PtController {

     @GetMapping("/")
  public String patientget(){
    return "Patient Service";
  }
    
}
