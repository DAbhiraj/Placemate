package com.placemate.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Skills {

    @Id
    private Integer Id;
    
    private String skill;
}
