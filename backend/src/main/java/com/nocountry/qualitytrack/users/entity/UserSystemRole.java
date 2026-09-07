package com.nocountry.qualitytrack.users.entity;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "user_system_roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSystemRole {

    @EmbeddedId
    private UserSystemRoleId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    public UserSystemRole(User user, SystemRole role) {
        this.user = user;
        this.id = new UserSystemRoleId(user.getId(), role);
    }

    public SystemRole getRole() {
        return id.getRole();
    }
}
