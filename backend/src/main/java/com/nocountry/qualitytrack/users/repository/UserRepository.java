package com.nocountry.qualitytrack.users.repository;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByIdAndAccountType(Long id, AccountType accountType);

    List<User> findAllByAccountTypeOrderByFirstNameAscLastNameAscIdAsc(AccountType accountType);

    boolean existsByEmail(String email);

    boolean existsByIdAndStatus(Long id, UserStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :userId")
    Optional<User> findByIdForUpdate(@Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select u
            from User u
            where u.accountType = :accountType
              and u.status = :status
              and u.id in (
                  select r.user.id
                  from UserSystemRole r
                  where r.id.role = :role
              )
            order by u.id
            """)
    List<User> findInternalUsersByRoleAndStatusForUpdate(
            @Param("accountType") AccountType accountType,
            @Param("status") UserStatus status,
            @Param("role") SystemRole role
    );
}
