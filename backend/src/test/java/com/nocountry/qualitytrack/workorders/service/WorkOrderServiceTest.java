package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderSourceResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private QuotationRepository quotationRepository;
    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderSourceService sourceService;
    @Mock private WorkOrderDocumentService documentService;
    @Mock private WorkOrder workOrder;
    @Mock private Quotation approvedQuotation;
    @Mock private User createdByUser;
    @Mock private WorkOrderSourceResponse source;

    private WorkOrderService service;

    @BeforeEach
    void setUp() {
        service = new WorkOrderService(
                workOrderRepository,
                quotationRepository,
                accessPolicy,
                sourceService,
                documentService
        );
    }

    @Test
    void listRequiresInternalReadPermission() {
        when(workOrderRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        var response = service.list(10L);

        assertEquals(0, response.size());
        verify(accessPolicy).requireInternalReader(10L);
        verify(workOrderRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getReturnsNotFoundWhenWorkOrderDoesNotExist() {
        when(workOrderRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.get(10L, 99L)
        );

        assertEquals(ApiErrorCode.RESOURCE_NOT_FOUND, exception.getCode());
        verify(accessPolicy).requireInternalReader(10L);
    }

    @Test
    void getReturnsOperationalSourcePinnedDocumentsAndApprovedAgreement() {
        when(workOrderRepository.findById(7L)).thenReturn(Optional.of(workOrder));
        when(sourceService.get(10L, workOrder)).thenReturn(source);
        when(documentService.listPinned(7L)).thenReturn(List.of());

        when(workOrder.getId()).thenReturn(7L);
        when(workOrder.getWorkOrderNumber()).thenReturn("OT-00000001");
        when(workOrder.getCreatedByUser()).thenReturn(createdByUser);
        when(createdByUser.getId()).thenReturn(10L);
        when(workOrder.getApprovedQuotation()).thenReturn(approvedQuotation);
        when(approvedQuotation.getQuotationNumber()).thenReturn("QT-00000001");
        when(approvedQuotation.getRevision()).thenReturn(2);

        var response = service.get(10L, 7L);

        assertEquals(7L, response.id());
        assertEquals("OT-00000001", response.workOrderNumber());
        assertSame(source, response.source());
        assertEquals(0, response.pinnedDocuments().size());
        assertEquals("QT-00000001", response.agreement().quotationNumber());
        assertEquals(2, response.agreement().revision());
    }
}
