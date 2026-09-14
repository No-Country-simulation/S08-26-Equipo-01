package com.nocountry.qualitytrack.users.repository;

import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.entity.UserSystemRoleId;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSystemRoleRepository extends JpaRepository<UserSystemRole, UserSystemRoleId> {

    List<UserSystemRole> findAllByIdUserId(Long userId);

    boolean existsByIdUserIdAndIdRole(Long userId, SystemRole role);

    boolean existsById_RoleAndUser_AccountType(SystemRole role, AccountType accountType);

    void deleteAllByIdUserId(Long userId);
}
