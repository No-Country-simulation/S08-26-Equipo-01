package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.quotations.dto.request.QuotationItemRequest;
import com.nocountry.qualitytrack.quotations.dto.request.UpdateQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.service.QuotationWorkflowService;
import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.request.DefineCaseMaterialSpecificationRequest;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.enums.RequestDeliveryMode;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.JobCaseWorkflowService;
import com.nocountry.qualitytrack.workorders.dto.request.CreateWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@Profile("seed-demo")
@RequiredArgsConstructor
public class DemoCommercialSeeder {

    private final CustomerRequestService customerRequestService;
    private final JobCaseWorkflowService jobCaseWorkflowService;
    private final QuotationWorkflowService quotationWorkflowService;
    private final WorkOrderWorkflowService workOrderWorkflowService;

    void seedReviewScenarios(
            DemoInternalActors actors,
            DemoCustomer customer
    ) {
        createRequest(
                customer,
                "MP-2026-001",
                "Fabricación de ejes para transmisión",
                20,
                MaterialRequirementType.SPECIFIED,
                "Acero inoxidable AISI 304"
        );

        DemoRequest underReview = createRequest(
                customer,
                "MP-2026-002",
                "Carcasa de aluminio CNC",
                12,
                MaterialRequirementType.SPECIFIED,
                "Aluminio 6061-T6"
        );
        take(actors, underReview);

        DemoRequest waiting = createRequest(
                customer,
                "MP-2026-003",
                "Eje principal para reductor",
                8,
                MaterialRequirementType.SPECIFIED,
                "Acero AISI 4140"
        );
        take(actors, waiting);

        jobCaseWorkflowService.requestInformation(
                actors.commercial().getId(),
                waiting.caseId(),
                new CreateCaseInformationRequest(
                        "¿Pueden confirmar la tolerancia final del diámetro de ajuste?"
                )
        );

        DemoRequest ready = createRequest(
                customer,
                "MP-2026-004",
                "Mecanizado de brida industrial",
                16,
                MaterialRequirementType.ASSISTANCE_REQUIRED,
                "Requerimos recomendación de material según carga y ambiente."
        );
        take(actors, ready);

        jobCaseWorkflowService.defineMaterialSpecification(
                actors.engineering().getId(),
                ready.caseId(),
                new DefineCaseMaterialSpecificationRequest(
                        "Acero al carbón",
                        "ASTM A36",
                        "Adecuado para la carga indicada y posterior protección superficial."
                )
        );

        jobCaseWorkflowService.completeReview(
                actors.commercial().getId(),
                ready.caseId()
        );
    }

    void seedQuotationScenarios(
            DemoInternalActors actors,
            DemoCustomer maquinados,
            DemoCustomer motores
    ) {
        DemoRequest draftRequest = readyRequest(
                actors,
                maquinados,
                "MP-2026-005",
                "Engrane helicoidal",
                24,
                "Acero AISI 8620"
        );
        createQuotationDraft(actors, draftRequest, "1850.00");

        DemoRequest sentRequest = readyRequest(
                actors,
                motores,
                "MN-2026-001",
                "Soporte de motor serie M",
                10,
                "Aluminio 6061-T6"
        );
        sendQuotation(
                actors,
                createQuotationDraft(actors, sentRequest, "2450.00")
        );

        DemoRequest approvedRequest = readyRequest(
                actors,
                motores,
                "MN-2026-002",
                "Polea dentada de precisión",
                18,
                "Acero AISI 1045"
        );
        approveQuotation(
                actors,
                approvedRequest,
                createQuotationDraft(actors, approvedRequest, "1320.00")
        );
    }

    DemoWorkOrder createApprovedWorkOrder(
            DemoInternalActors actors,
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            String material,
            WorkOrderPriority priority,
            String unitPrice
    ) {
        DemoRequest request = readyRequest(
                actors,
                customer,
                customerReference,
                title,
                quantity,
                material
        );

        QuotationDetailResponse quotation =
                createQuotationDraft(actors, request, unitPrice);
        approveQuotation(actors, request, quotation);

        WorkOrderDetailResponse workOrder = workOrderWorkflowService.create(
                actors.commercial().getId(),
                request.caseId(),
                new CreateWorkOrderRequest(
                        priority,
                        LocalDate.now().plusDays(2),
                        LocalDate.now().plusDays(20)
                )
        );

        return new DemoWorkOrder(
                request,
                workOrder.id(),
                quantity
        );
    }

    private DemoRequest readyRequest(
            DemoInternalActors actors,
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            String material
    ) {
        DemoRequest request = createRequest(
                customer,
                customerReference,
                title,
                quantity,
                MaterialRequirementType.SPECIFIED,
                material
        );

        take(actors, request);
        jobCaseWorkflowService.completeReview(
                actors.commercial().getId(),
                request.caseId()
        );

        return request;
    }

    private DemoRequest createRequest(
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            MaterialRequirementType materialType,
            String material
    ) {
        CustomerRequestResponse response = customerRequestService.submit(
                customer.owner().getId(),
                customer.customer().getId(),
                new SubmitCustomerRequest(
                        customerReference,
                        title,
                        "Solicitud demo determinística para validar el flujo completo de QualityTrack.",
                        quantity,
                        materialType,
                        material,
                        LocalDate.now().plusDays(60),
                        RequestDeliveryMode.CUSTOM_ADDRESS,
                        null,
                        "Planta principal",
                        "Av. Industrial 1250",
                        customer.customer().getCity(),
                        customer.customer().getState(),
                        "63000",
                        "México",
                        "Recepción de materiales",
                        "311-555-0100",
                        "Entregar de lunes a viernes de 09:00 a 16:00."
                )
        );

        return new DemoRequest(
                customer,
                response.id(),
                response.jobCase().id(),
                title,
                quantity
        );
    }

    private void take(
            DemoInternalActors actors,
            DemoRequest request
    ) {
        jobCaseWorkflowService.take(
                actors.commercial().getId(),
                request.caseId()
        );
    }

    private QuotationDetailResponse createQuotationDraft(
            DemoInternalActors actors,
            DemoRequest request,
            String unitPrice
    ) {
        QuotationDetailResponse quotation = quotationWorkflowService.create(
                actors.commercial().getId(),
                request.caseId()
        );

        return quotationWorkflowService.update(
                actors.commercial().getId(),
                quotation.id(),
                new UpdateQuotationRequest(
                        "MXN",
                        new BigDecimal("16.0000"),
                        LocalDate.now().plusDays(21),
                        LocalDate.now().plusDays(45),
                        List.of(
                                new QuotationItemRequest(
                                        null,
                                        request.title(),
                                        BigDecimal.valueOf(request.quantity()),
                                        new BigDecimal(unitPrice)
                                )
                        )
                )
        );
    }

    private QuotationDetailResponse sendQuotation(
            DemoInternalActors actors,
            QuotationDetailResponse quotation
    ) {
        return quotationWorkflowService.send(
                actors.commercial().getId(),
                quotation.id(),
                null
        );
    }

    private void approveQuotation(
            DemoInternalActors actors,
            DemoRequest request,
            QuotationDetailResponse quotation
    ) {
        QuotationDetailResponse sent = sendQuotation(actors, quotation);

        quotationWorkflowService.approve(
                request.customer().owner().getId(),
                request.customer().customer().getId(),
                sent.id()
        );
    }
}
