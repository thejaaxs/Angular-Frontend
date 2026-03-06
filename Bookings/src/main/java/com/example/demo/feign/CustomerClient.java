package com.example.demo.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "CUSTOMER")
public interface CustomerClient {

    @GetMapping("/customers/{id}")
    Object getCustomerById(@PathVariable("id") Long id);
}