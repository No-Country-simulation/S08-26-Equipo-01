package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestSubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.bind.support.WebDataBinderFactory;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CustomerRequestControllerMultipartTest {

    @Mock CustomerRequestService customerRequestService;
    @Mock CustomerRequestSubmissionService customerRequestSubmissionService;
    @Mock CustomerRequestDocumentService customerRequestDocumentService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new CustomerRequestController(
                        customerRequestService,
                        customerRequestSubmissionService,
                        customerRequestDocumentService
                ))
                .setCustomArgumentResolvers(new CurrentUserIdResolver())
                .build();
    }

    @Test
    void bindsEachInitialDocumentAsOneMultipartObject() throws Exception {
        MockMultipartFile drawing = new MockMultipartFile(
                "documents[0].file", "plano.png", "image/png", new byte[]{1, 2, 3}
        );
        MockMultipartFile photo = new MockMultipartFile(
                "documents[1].file", "referencia.jpg", "image/jpeg", new byte[]{4, 5, 6}
        );
        CustomerRequestResponse response = mock(CustomerRequestResponse.class);
        when(customerRequestSubmissionService.submit(eq(10L), eq(1L), any(), any()))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/v1/customers/{customerId}/requests", 1L)
                        .file(drawing)
                        .file(photo)
                        .param("title", "Fabricación de eje")
                        .param("description", "Fabricar conforme al plano")
                        .param("quantity", "20")
                        .param("materialRequirementType", "SPECIFIED")
                        .param("materialRequirement", "AISI 304")
                        .param("requestedDeliveryDate", LocalDate.now().plusDays(10).toString())
                        .param("documents[0].documentType", "TECHNICAL_DRAWING")
                        .param("documents[0].name", "Plano técnico")
                        .param("documents[1].documentType", "REFERENCE_IMAGE")
                        .param("documents[1].name", "Pieza actual"))
                .andExpect(status().isCreated());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<CreateRequestDocumentForm>> captor = ArgumentCaptor.forClass(List.class);
        verify(customerRequestSubmissionService).submit(eq(10L), eq(1L), any(), captor.capture());

        List<CreateRequestDocumentForm> documents = captor.getValue();
        assertNotNull(documents);
        assertEquals(2, documents.size());
        assertEquals("TECHNICAL_DRAWING", documents.get(0).getDocumentType());
        assertEquals("Plano técnico", documents.get(0).getName());
        assertEquals("plano.png", documents.get(0).getFile().getOriginalFilename());
        assertEquals("REFERENCE_IMAGE", documents.get(1).getDocumentType());
        assertEquals("referencia.jpg", documents.get(1).getFile().getOriginalFilename());
    }

    @Test
    void keepsStandaloneDocumentUploadCoherent() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "plano-v2.png", "image/png", new byte[]{7, 8, 9}
        );
        when(customerRequestDocumentService.create(eq(10L), eq(1L), eq(31L), any(), eq(file)))
                .thenReturn(mock(RequestDocumentResponse.class));

        mockMvc.perform(multipart(
                        "/api/v1/customers/{customerId}/requests/{requestId}/documents", 1L, 31L)
                        .file(file)
                        .param("documentType", "TECHNICAL_DRAWING")
                        .param("name", "Plano actualizado")
                        .param("description", "Nueva revisión"))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateRequestDocument> metadata = ArgumentCaptor.forClass(CreateRequestDocument.class);
        verify(customerRequestDocumentService).create(eq(10L), eq(1L), eq(31L), metadata.capture(), eq(file));
        assertEquals("TECHNICAL_DRAWING", metadata.getValue().documentType());
        assertEquals("Plano actualizado", metadata.getValue().name());
    }

    private static final class CurrentUserIdResolver implements HandlerMethodArgumentResolver {
        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(CurrentUserId.class);
        }

        @Override
        public Object resolveArgument(
                MethodParameter parameter,
                ModelAndViewContainer mavContainer,
                NativeWebRequest webRequest,
                WebDataBinderFactory binderFactory
        ) {
            return 10L;
        }
    }
}
