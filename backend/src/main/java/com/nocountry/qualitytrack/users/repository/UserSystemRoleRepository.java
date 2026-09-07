package com.nocountry.qualitytrack.users.repository;

import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.entity.UserSystemRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSystemRoleRepository extends JpaRepository<UserSystemRole, UserSystemRoleId> {

    List<UserSystemRole> findAllByIdUserId(Long userId);
}
