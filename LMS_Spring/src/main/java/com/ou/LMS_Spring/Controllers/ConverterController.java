package com.ou.LMS_Spring.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;


@RestController
public class ConverterController {

    @GetMapping("/convert")
    public  Map<String,Object> convert (
        @RequestParam double usd
    )
    {
        double rate = 25000;
        double vnd = usd *rate;
        return Map.of(
            "usd" , usd,
            "vnd" , vnd
        );
    }
}
