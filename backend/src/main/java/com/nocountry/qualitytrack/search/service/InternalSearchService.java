package com.nocountry.qualitytrack.search.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.materials.entity.Material;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.search.dto.response.InternalSearchResponse;
import com.nocountry.qualitytrack.search.dto.response.InternalSearchResultResponse;
import com.nocountry.qualitytrack.search.enums.InternalSearchResultType;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InternalSearchService {

    private static final int PER_TYPE_LIMIT = 6;
    private static final int TOTAL_LIMIT = 12;

    private static final Set<SystemRole> OPERATIONAL_READ_ROLES = EnumSet.of(
            SystemRole.ADMIN,
            SystemRole.COMMERCIAL,
            SystemRole.ENGINEERING,
            SystemRole.PRODUCTION,
            SystemRole.QUALITY,
            SystemRole.LOGISTICS,
            SystemRole.AUDITOR
    );

    private static final Set<SystemRole> QUOTATION_READ_ROLES = EnumSet.of(
            SystemRole.ADMIN,
            SystemRole.COMMERCIAL,
            SystemRole.AUDITOR
    );

    private final CustomerRepository customerRepository;
    private final JobCaseRepository jobCaseRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;
    private final MaterialRepository materialRepository;
    private final MaterialLotRepository materialLotRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;

    @Transactional(readOnly = true)
    public InternalSearchResponse search(Long currentUserId, String rawQuery) {
        User user = requireActiveInternalUser(currentUserId);
        Set<SystemRole> roles = rolesFor(user.getId());
        String query = normalizeQuery(rawQuery);

        if (query.length() < 2) {
            return new InternalSearchResponse(query, List.of());
        }

        String pattern = "%" + query.toLowerCase(Locale.ROOT) + "%";
        Pageable page = PageRequest.of(0, PER_TYPE_LIMIT);
        List<InternalSearchResultResponse> results = new ArrayList<>();

        customerRepository.searchInternal(pattern, page)
                .stream()
                .map(this::customerResult)
                .forEach(results::add);

        if (hasAnyRole(roles, OPERATIONAL_READ_ROLES)) {
            jobCaseRepository.searchInternal(pattern, page)
                    .stream()
                    .map(this::jobCaseResult)
                    .forEach(results::add);

            workOrderRepository.searchInternal(pattern, page)
                    .stream()
                    .map(this::workOrderResult)
                    .forEach(results::add);

            materialRepository.searchInternal(pattern, page)
                    .stream()
                    .map(this::materialResult)
                    .forEach(results::add);

            materialLotRepository.searchInternal(pattern, page)
                    .stream()
                    .map(this::materialLotResult)
                    .forEach(results::add);

            documentRepository.searchInternal(DocumentStatus.ACTIVE, pattern, page)
                    .stream()
                    .map(this::documentResult)
                    .forEach(results::add);
        }

        if (hasAnyRole(roles, QUOTATION_READ_ROLES)) {
            quotationRepository.searchCurrentInternal(pattern, page)
                    .stream()
                    .map(this::quotationResult)
                    .forEach(results::add);
        }

        List<InternalSearchResultResponse> ranked = results.stream()
                .sorted(Comparator
                        .comparingInt((InternalSearchResultResponse result) ->
                                matchScore(result, query))
                        .thenComparing(result -> result.type().ordinal())
                        .thenComparing(InternalSearchResultResponse::title))
                .limit(TOTAL_LIMIT)
                .toList();

        return new InternalSearchResponse(query, ranked);
    }

    private InternalSearchResultResponse customerResult(Customer customer) {
        String subtitle = firstNonBlank(
                customer.getRfc(),
                customer.getAdministrativeEmail(),
                customer.getPhone()
        );
        String context = joinNonBlank(", ", customer.getCity(), customer.getState());

        return new InternalSearchResultResponse(
                InternalSearchResultType.CUSTOMER,
                customer.getId(),
                customer.getName(),
                subtitle,
                context,
                customer.getStatus().name(),
                "/customers/" + customer.getId()
        );
    }

    private InternalSearchResultResponse jobCaseResult(JobCase jobCase) {
        var request = jobCase.getCustomerRequest();

        return new InternalSearchResultResponse(
                InternalSearchResultType.JOB_CASE,
                jobCase.getId(),
                jobCase.getCaseNumber(),
                request.getTitle(),
                request.getCustomer().getName() + " · " + request.getRequestNumber(),
                jobCase.getStatus().name(),
                "/job-cases/" + jobCase.getId()
        );
    }

    private InternalSearchResultResponse quotationResult(Quotation quotation) {
        var request = quotation.getJobCase().getCustomerRequest();

        return new InternalSearchResultResponse(
                InternalSearchResultType.QUOTATION,
                quotation.getId(),
                quotation.getQuotationNumber() + " · Rev " + quotation.getRevision(),
                request.getCustomer().getName(),
                quotation.getJobCase().getCaseNumber() + " · " + request.getRequestNumber(),
                quotation.getStatus().name(),
                "/quotations/" + quotation.getId()
        );
    }

    private InternalSearchResultResponse workOrderResult(WorkOrder workOrder) {
        var request = workOrder.getJobCase().getCustomerRequest();

        return new InternalSearchResultResponse(
                InternalSearchResultType.WORK_ORDER,
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                request.getTitle(),
                request.getCustomer().getName() + " · " + workOrder.getJobCase().getCaseNumber(),
                workOrder.getStatus().name(),
                "/work-orders/" + workOrder.getId()
        );
    }

    private InternalSearchResultResponse materialResult(Material material) {
        return new InternalSearchResultResponse(
                InternalSearchResultType.MATERIAL,
                material.getId(),
                material.getCode() + " · " + material.getName(),
                firstNonBlank(material.getSpecification(), "Unidad " + material.getUnit()),
                "Material de producción",
                null,
                "/resources?tab=materials&materialId=" + material.getId()
        );
    }

    private InternalSearchResultResponse materialLotResult(MaterialLot lot) {
        Material material = lot.getMaterial();

        return new InternalSearchResultResponse(
                InternalSearchResultType.MATERIAL_LOT,
                lot.getId(),
                lot.getLotNumber(),
                material.getCode() + " · " + material.getName(),
                firstNonBlank(lot.getSupplier(), "Lote de producción"),
                lot.getCertificateDocumentVersion() == null ? null : "CERTIFICADO",
                "/resources?tab=materials&materialId="
                        + material.getId()
                        + "&lotId="
                        + lot.getId()
        );
    }

    private InternalSearchResultResponse documentResult(Document document) {
        String context;
        String href;

        if (document.getJobCase() != null) {
            context = document.getJobCase().getCaseNumber();
            href = "/job-cases/"
                    + document.getJobCase().getId()
                    + "?tab=documents#document-"
                    + document.getId();
        } else {
            MaterialLot lot = document.getMaterialLot();
            context = "Lote " + lot.getLotNumber() + " · " + lot.getMaterial().getCode();
            href = "/resources?tab=materials&materialId="
                    + lot.getMaterial().getId()
                    + "&lotId="
                    + lot.getId();
        }

        return new InternalSearchResultResponse(
                InternalSearchResultType.DOCUMENT,
                document.getId(),
                document.getName(),
                document.getDocumentType(),
                context,
                null,
                href
        );
    }

    private int matchScore(InternalSearchResultResponse result, String query) {
        String term = query.toLowerCase(Locale.ROOT);
        String title = lower(result.title());
        String subtitle = lower(result.subtitle());
        String context = lower(result.context());

        if (title.equals(term)) return 0;
        if (title.startsWith(term)) return 1;
        if (title.contains(term)) return 2;
        if (subtitle.startsWith(term)) return 3;
        if (subtitle.contains(term)) return 4;
        if (context.startsWith(term)) return 5;
        if (context.contains(term)) return 6;
        return 7;
    }

    private Set<SystemRole> rolesFor(Long userId) {
        Set<SystemRole> roles = EnumSet.noneOf(SystemRole.class);
        userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .forEach(roles::add);
        return roles;
    }

    private boolean hasAnyRole(Set<SystemRole> actual, Set<SystemRole> allowed) {
        return actual.stream().anyMatch(allowed::contains);
    }

    private User requireActiveInternalUser(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "Solo un usuario interno activo puede utilizar la búsqueda global."
                ));

        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un usuario interno activo puede utilizar la búsqueda global."
            );
        }

        return user;
    }

    private String normalizeQuery(String value) {
        if (value == null) {
            return "";
        }

        return value.trim()
                .replace("%", "")
                .replace("_", "")
                .replaceAll("\\s+", " ");
    }

    private String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private String joinNonBlank(String separator, String... values) {
        return java.util.Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .reduce((left, right) -> left + separator + right)
                .orElse(null);
    }
}
