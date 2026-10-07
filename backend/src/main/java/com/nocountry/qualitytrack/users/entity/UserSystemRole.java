package com.nocountry.qualitytrack.users.entity;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import jakarta.persistence.*;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedByUser;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    public UserSystemRole(User user, SystemRole role) {
        this(user, role, null);
    }

    public UserSystemRole(User user, SystemRole role, User assignedByUser) {
        this.user = user;
        this.id = new UserSystemRoleId(user.getId(), role);
        this.assignedByUser = assignedByUser;
    }

    public SystemRole getRole() {
        return id.getRole();
    }
}
