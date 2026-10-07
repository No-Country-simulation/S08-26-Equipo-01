package com.nocountry.qualitytrack.requests.dto.request;

import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.enums.RequestDeliveryMode;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SubmitCustomerRequest(
        @Size(max = 120)
        String customerReference,

        @NotBlank
        @Size(max = 200)
        String title,

        @NotBlank
        @Size(max = 5000)
        String description,

        @NotNull
        @Positive
        Integer quantity,

        @NotNull
        MaterialRequirementType materialRequirementType,

        @NotBlank
        @Size(max = 2000)
        String materialRequirement,

        @FutureOrPresent
        LocalDate requestedDeliveryDate,

        @NotNull
        RequestDeliveryMode deliveryMode,

        Long customerAddressId,

        @Size(max = 120)
        String deliveryLabel,

        @Size(max = 300)
        String deliveryAddress,

        @Size(max = 120)
        String deliveryCity,

        @Size(max = 120)
        String deliveryState,

        @Size(max = 20)
        String deliveryPostalCode,

        @Size(max = 100)
        String deliveryCountry,

        @Size(max = 160)
        String deliveryContactName,

        @Size(max = 30)
        String deliveryContactPhone,

        @Size(max = 1000)
        String deliveryInstructions
) {
}
