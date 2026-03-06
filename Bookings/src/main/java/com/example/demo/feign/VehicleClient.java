package com.example.demo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "VEHICLE")
public interface VehicleClient {

    @GetMapping("/vehicles/{id}")
    Object getVehicleById(@PathVariable("id") Long id);
}