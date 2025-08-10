package com.placemate.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import java.util.*;

@Entity
@Data
public class Companies {
    @Id
    private Integer id;

    private String name;
    private Integer stipend;
    private Integer ctc;
    private String linkToApply;
    private double cgpaCutoff;
    @OneToMany
    private List<Branches> eligibleBranches;

    @OneToMany
    private List<Locations> locations;
    private Date lastDateToApply;

}
