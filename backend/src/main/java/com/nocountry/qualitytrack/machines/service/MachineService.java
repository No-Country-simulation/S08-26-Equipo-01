package com.nocountry.qualitytrack.machines.service;

import com.nocountry.qualitytrack.machines.dto.request.CreateMachineRequest;
import com.nocountry.qualitytrack.machines.dto.response.MachineResponse;
import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.machines.repository.MachineRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepository;
    private final WorkOrderAccessPolicy accessPolicy;

    @Transactional
    public MachineResponse create(Long currentUserId, CreateMachineRequest request) {
        accessPolicy.requireProductionActor(currentUserId);

        if (machineRepository.existsByCodeIgnoreCase(request.code())) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "Ya existe una máquina con ese código."
            );
        }

        Machine machine;
        try {
            machine = Machine.create(request.code(), request.name(), request.type());
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    exception.getMessage(),
                    exception
            );
        }

        return MachineResponse.from(machineRepository.saveAndFlush(machine));
    }

    @Transactional(readOnly = true)
    public List<MachineResponse> list(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);
        return machineRepository.findAll()
                .stream()
                .map(MachineResponse::from)
                .toList();
    }
}
