package org.manudev.auth_catalog_kata.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String code;


    @Column(nullable = false)
    private String title;


    @Column(columnDefinition = "text")
    private String description;


    @Column(name = "image_url")
    private String imageUrl;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
