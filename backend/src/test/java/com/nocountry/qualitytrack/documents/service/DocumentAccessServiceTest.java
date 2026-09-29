package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentAccessServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSystemRoleRepository userSystemRoleRepository;
    @Mock private CustomerMembershipRepository membershipRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private User user;
    @Mock private User internalCreator;
    @Mock private UserSystemRole systemRole;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private CustomerMembership membership;
    @Mock private Document document;
    @Mock private DocumentVersion version;
    @Mock private Delivery delivery;

    private DocumentAccessService service;

    @BeforeEach
    void setUp() {
        service = new DocumentAccessService(
                userRepository,
                userSystemRoleRepository,
                membershipRepository,
                deliveryRepository
        );
    }

    @Test
    void logisticsCanWriteOnlyDeliveryEvidence() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.LOGISTICS);
        when(jobCase.getStatus()).thenReturn(JobCaseStatus.IN_PRODUCTION);

        assertThrows(
                BusinessException.class,
                () -> service.requireCanCreate(10L, jobCase, "DRAWING")
        );

        assertSame(
                user,
                service.requireCanCreate(10L, jobCase, "DELIVERY_EVIDENCE")
        );
    }

    @Test
    void customerCannotReadUnlinkedInternalDeliveryEvidence() {
        stubCustomerEvidenceContext();
        when(deliveryRepository
                .findAllByEvidenceDocumentVersion_IdAndWorkOrder_JobCase_CustomerRequest_Customer_Id(
                        99L,
                        40L
                ))
                .thenReturn(List.of());

        assertThrows(
                BusinessException.class,
                () -> service.requireCanReadVersion(20L, version)
        );
    }

    @Test
    void customerCanReadEvidenceLinkedToDispatchedDelivery() {
        stubCustomerEvidenceContext();
        when(delivery.getStatus()).thenReturn(DeliveryStatus.DISPATCHED);
        when(deliveryRepository
                .findAllByEvidenceDocumentVersion_IdAndWorkOrder_JobCase_CustomerRequest_Customer_Id(
                        99L,
                        40L
                ))
                .thenReturn(List.of(delivery));

        assertSame(user, service.requireCanReadVersion(20L, version));
    }

    private void stubCustomerEvidenceContext() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(version.getId()).thenReturn(99L);
        when(version.getDocument()).thenReturn(document);
        when(document.getJobCase()).thenReturn(jobCase);
        when(document.getCreatedBy()).thenReturn(internalCreator);
        when(internalCreator.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(document.getDocumentType()).thenReturn("DELIVERY_EVIDENCE");
        when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        when(customerRequest.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(40L);
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                40L,
                20L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(membership.getCustomer()).thenReturn(customer);
    }
}
