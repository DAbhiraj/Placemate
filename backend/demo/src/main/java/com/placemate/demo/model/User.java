package com.placemate.demo.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    private Integer id;

    private String fullName;
    private String rollNo;
    private String email;
    private String branch;
    private double cgpa;
    private String phoneNo;
    private String graduationLevel;
    private Integer year;

    @OneToMany
    private List<Skills> skills;

    // to do for resume.pdf
    private Object resume;

    private Integer totalApplications;
    private Integer interviews;
    private List<Companies> upcoming;
    private List<Companies> appliedCompanies;
}
