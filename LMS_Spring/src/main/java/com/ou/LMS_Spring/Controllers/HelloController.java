package com.ou.LMS_Spring.Controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class HelloController {

    @GetMapping("/greet")
    public String greet(
            @RequestParam String name,
            @RequestParam(defaultValue = "en") String lang) {

        if (lang.equals("vi")) {
            return "Xin chào " + name;
        } 
        else {
            return "Hello " + name;
        }
    }
}