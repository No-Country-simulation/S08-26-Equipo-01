package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.repository.EmailVerificationTokenRepository;
import com.nocountry.qualitytrack.auth.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteEmailVerificationToken(Long userId) {
        emailVerificationTokenRepository.deleteAllByIdInBatch(List.of(userId));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deletePasswordResetToken(Long userId) {
        passwordResetTokenRepository.deleteAllByIdInBatch(List.of(userId));
    }
}
