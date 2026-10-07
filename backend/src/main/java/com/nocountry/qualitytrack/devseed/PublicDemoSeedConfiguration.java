package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.quotations.service.QuotationWorkflowService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.JobCaseWorkflowService;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.routing.service.RoutingWorkflowService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderDocumentService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!seed-demo")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class PublicDemoSeedConfiguration {

    @Bean
    DemoCommercialSeeder publicDemoCommercialSeeder(
            CustomerRequestService customerRequestService,
            JobCaseWorkflowService jobCaseWorkflowService,
            QuotationWorkflowService quotationWorkflowService,
            WorkOrderWorkflowService workOrderWorkflowService
    ) {
        return new DemoCommercialSeeder(
                customerRequestService,
                jobCaseWorkflowService,
                quotationWorkflowService,
                workOrderWorkflowService
        );
    }

    @Bean
    DemoOperationsSeeder publicDemoOperationsSeeder(
            DemoCommercialSeeder commercialSeeder,
            DocumentService documentService,
            WorkOrderDocumentService workOrderDocumentService,
            RoutingService routingService,
            RoutingWorkflowService routingWorkflowService,
            ProductionWorkflowService productionWorkflowService,
            QualityWorkflowService qualityWorkflowService,
            DeliveryService deliveryService
    ) {
        return new DemoOperationsSeeder(
                commercialSeeder,
                documentService,
                workOrderDocumentService,
                routingService,
                routingWorkflowService,
                productionWorkflowService,
                qualityWorkflowService,
                deliveryService
        );
    }
}
